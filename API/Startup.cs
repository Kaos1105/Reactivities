using System.Text;
using System.Threading.Tasks;
using API.Middleware;
using API.SignalR;
using Application.Activities;
using Application.Interfaces;
using Application.Profiles;
using AutoMapper;
using Domain;
using FluentValidation.AspNetCore;
using Infrastructure.Photos;
using Infrastructure.Security;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Persistence;

namespace API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddDbContext<DataContext>(opt =>
            {
                opt.UseSqlite(Configuration.GetConnectionString("DefaultConnection"));
                opt.UseLazyLoadingProxies();
            });
            //add CORS for Cross origin requests
            services.AddCors(opt =>
            {
                opt.AddPolicy("CorsPolicy", policy =>
                {
                    //since statusText not work add custom statusText to the header
                    policy.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod().AllowCredentials()/*.WithExposedHeaders("status-text")*/;
                });
            });

            //Add MediatR service
            services.AddMediatR(typeof(List.Handler).Assembly);
            //Add AutoMapper
            services.AddAutoMapper(typeof(List.Handler));
            //Add NewtonJson
            services.AddControllers().AddNewtonsoftJson();
            //Add Fluent service
            services.AddMvc(option =>
                {
                    //option.EnableEndpointRouting = false;

                    //every request needed to be authorized
                    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
                    option.Filters.Add(new AuthorizeFilter(policy));
                }
            ).AddFluentValidation(config => config.RegisterValidatorsFromAssemblyContaining<Create>());
            //.AddNewtonsoftJson(opt => opt.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore);

            //Add SignalR service
            services.AddSignalR();

            //Add Identity Service
            var builder = services.AddIdentityCore<AppUser>();
            var identityBuilder = new IdentityBuilder(builder.UserType, builder.Services);
            identityBuilder.AddEntityFrameworkStores<DataContext>();
            identityBuilder.AddSignInManager<SignInManager<AppUser>>();
            //services.AddIdentity<IdentityUser, IdentityRole>().AddEntityFrameworkStores<DataContext>();

            //Add authorization policy
            services.AddAuthorization(opt =>
            {
                opt.AddPolicy("IsActivityHost", policy =>
                {
                    policy.Requirements.Add(new IsHostRequirement());
                });
            });
            //AuthorizationHandler inject
            services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();
            services.AddHttpContextAccessor();

            //Add Authentication service
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["TokenKey"]));
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(opt =>
            {
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateAudience = false,
                    ValidateIssuer = false
                };
                opt.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && (path.StartsWithSegments("/chatHub")))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            //Add JWT Generator Service use concrete class for interface
            services.AddScoped<IJWTGenerator, JWTGenerator>();
            //Add UserNameAccess from token service
            services.AddScoped<IUserAccessor, UserAccessor>();
            //Add PhotoAccessor Service
            services.AddScoped<IPhotoAccessor, PhotoAccessor>();
            //Add IProfileReader Service
            services.AddScoped<IProfileReader, ProfileReader>();

            //Add CloudinarySetting config
            services.Configure<CloudinarySettings>(Configuration.GetSection("Cloudinary"));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseMiddleware<ErrorHandlingMiddleware>();
            if (env.IsDevelopment())
            {
                //app.UseDeveloperExceptionPage();

            }
            //--------------------------DO NOT FUCKING MOVE THE ORDER OF THESE BELOW----------------------------------
            app.UseHttpsRedirection();

            app.UseRouting();

            //use Cors policy to middleware
            app.UseCors("CorsPolicy"
            //options => options.WithOrigins("http://localhost:3000").AllowAnyMethod().AllowAnyHeader().AllowCredentials()
            );

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<ChatHub>("/chatHub");
            });

            //app.UseMvc();
        }
    }
}
