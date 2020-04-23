using System;
using System.Net;
using System.Threading.Tasks;
using Application.Errors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace API.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            this._next = next;
            this._logger = logger;
        }

        //Invoke middle ware, if no exception pass it to the next request, else pass it to custom handle Exception 
        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex, _logger);
            }
        }

        //Handle Custom Exception
        private async Task HandleExceptionAsync(HttpContext context, Exception ex, ILogger<ErrorHandlingMiddleware> logger)
        {
            object errors = null;
            switch (ex)
            {
                //handle Exception in client side by sending response with HTTP Status
                case RestException rest:
                    logger.LogError(ex, "REST ERROR");
                    errors = rest.Errors;
                    context.Response.StatusCode = (int)rest.Code;
                    break;
                case Exception exception:
                    logger.LogError(ex, "SEVER ERROR");
                    errors = string.IsNullOrWhiteSpace(exception.Message) ? "Error" : exception.Message;
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;
            }
            context.Response.ContentType = "application/json";
            //context.Response.Headers.Add("Status-Text", ReasonPhrases.GetReasonPhrase(context.Response.StatusCode));
            if (errors != null)
            {
                var result = JsonConvert.SerializeObject(new
                {
                    errors
                });
                await context.Response.WriteAsync(result);
            }
        }
    }
}