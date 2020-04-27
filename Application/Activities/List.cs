using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class List
    {
        public class Query : IRequest<List<ActivityDTO>> { }

        public class Handler : IRequestHandler<Query, List<ActivityDTO>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                this._context = context;
                this._mapper = mapper;
            }

            public async Task<List<ActivityDTO>> Handle(Query request, CancellationToken cancellationToken)
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

                //eager loading
                // var activities = await _context.Activities.Include(x => x.UserActivities).ThenInclude(x => x.AppUser).ToListAsync();

                //lazy loading
                var activities = await _context.Activities.ToListAsync();

                var returnActivities = _mapper.Map<List<Activity>, List<ActivityDTO>>(activities);
                return returnActivities;
            }
        }
    }
}