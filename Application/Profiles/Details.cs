using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class Details
    {
        public class Query : IRequest<Profile>
        {
            public string UserName { get; set; }
        }

        public class Handler : IRequestHandler<Query, Profile>
        {
            private readonly IProfileReader _profileReader;
            public Handler(IProfileReader profileReader)
            {
                this._profileReader = profileReader;
            }

            public async Task<Profile> Handle(Query request, CancellationToken cancellationToken)
            {
                //handler logic 
                return await _profileReader.ReadProfile(request.UserName);
            }
        }
    }
}