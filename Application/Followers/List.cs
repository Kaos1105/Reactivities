using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Profiles;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Followers
{
    public class List
    {
        public class Query : IRequest<List<Profile>>
        {
            public string UserName { get; set; }
            public string Predicate { get; set; }
        }

        public class Handler : IRequestHandler<Query, List<Profile>>
        {
            private readonly DataContext _context;
            private readonly IProfileReader _profileReader;
            public Handler(DataContext context, IProfileReader profileReader)
            {
                this._profileReader = profileReader;
                this._context = context;

            }

            public async Task<List<Profile>> Handle(Query request, CancellationToken cancellationToken)
            {
                //handler logic 
                var queryable = _context.Followings.AsQueryable();

                var userFollowings = new List<UserFollowing>();
                var profiles = new List<Profile>();

                switch (request.Predicate)
                {
                    case "followers":
                        {
                            userFollowings = await queryable.Where(x => x.Target.UserName == request.UserName).ToListAsync();

                            foreach (var followers in userFollowings)
                            {
                                profiles.Add(await _profileReader.ReadProfile(followers.Observer.UserName));
                            }
                            break;
                        }
                    case "followings":
                        {
                            userFollowings = await queryable.Where(x => x.Observer.UserName == request.UserName).ToListAsync();

                            foreach (var followers in userFollowings)
                            {
                                profiles.Add(await _profileReader.ReadProfile(followers.Target.UserName));
                            }
                            break;
                        }
                }
                return profiles;
            }
        }
    }
}