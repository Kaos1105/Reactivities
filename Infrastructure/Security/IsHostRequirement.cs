using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Persistence;

namespace Infrastructure.Security
{
    public class IsHostRequirement : IAuthorizationRequirement
    {

    }

    public class IsHostRequirementHandler : AuthorizationHandler<IsHostRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly DataContext _context;
        public IsHostRequirementHandler(IHttpContextAccessor httpContextAccessor, DataContext context)
        {
            this._httpContextAccessor = httpContextAccessor;
            this._context = context;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, IsHostRequirement requirement)
        {
            //use custom authorize policy
            //.NET CORE 2.2
            // if (context.Resource is AuthorizationFilterContext authContext)
            // {
            //     //check if current log in user is the host of the activity
            //     var currentUserName = _httpContextAccessor.HttpContext.User?.Claims?.SingleOrDefault(x => x.Type
            //       == ClaimTypes.NameIdentifier)?.Value;

            //     var activityId = Guid.Parse(authContext.RouteData.Values["id"].ToString());

            //     var activity = _context.Activities.FindAsync(activityId).Result;

            //     var host = activity.UserActivities.FirstOrDefault(x => x.IsHost);

            //     if (host?.AppUser?.UserName == currentUserName)
            //     {
            //         context.Succeed(requirement);
            //     }
            // }
            // else
            // {
            //     context.Fail();
            // }

            //.NET CORE 3.1
            //check if current log in user is the host of the activity
            var currentUserName = _httpContextAccessor.HttpContext.User?.Claims?.SingleOrDefault(x => x.Type
              == ClaimTypes.NameIdentifier)?.Value;

            var httpContext = _httpContextAccessor.HttpContext;

            var activityId = Guid.Parse(httpContext.Request.RouteValues["id"].ToString());

            var activity = _context.Activities.FindAsync(activityId).Result;

            var host = activity.UserActivities.FirstOrDefault(x => x.IsHost);

            if (host?.AppUser?.UserName == currentUserName)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail();
            }
            return Task.CompletedTask;
        }
    }
}