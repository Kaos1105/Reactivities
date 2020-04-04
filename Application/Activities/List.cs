using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class List
    {
        public class Query : IRequest<List<Activity>> { }

        public class Handler : IRequestHandler<Query, List<Activity>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                this._context = context;

            }

            public async Task<List<Activity>> Handle(Query request, CancellationToken cancellationToken)
            {
                //CancellationToken is using when request is cancel so that the sever will abort current response
                // try
                // {
                //     for (var i = 0; i < 10; i++)
                //     {
                //         cancellationToken.ThrowIfCancellationRequested();
                //         await Task.Delay(1000, cancellationToken);
                //         System.Console.WriteLine($"Task {i} has completed");
                //     }
                // }
                // catch (Exception e) when (e is TaskCanceledException)
                // {
                //     System.Console.WriteLine("Task was cancelled");
                // }

                var activities = await _context.Activities.ToListAsync();
                return activities;
            }
        }
    }
}