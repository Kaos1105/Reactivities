using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class ProfileReader : IProfileReader
    {
        private readonly DataContext _context;
        private readonly IUserAccessor _userAccessor;
        public ProfileReader(DataContext context, IUserAccessor userAccessor)
        {
            this._userAccessor = userAccessor;
            this._context = context;
        }

        public async Task<Profile> ReadProfile(string userName)
        {
            var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == userName);

            if (user == null)
                throw new RestException(HttpStatusCode.NotFound, new { User = "Not found" });
            var currentUser = await _context.Users.SingleOrDefaultAsync(x => x.UserName == _userAccessor.GetCurrentUserName());

            var profile = new Profile
            {
                DisplayName = user.DisplayName,
                UserName = user.UserName,
                Image = user.Photos.FirstOrDefault(x => x.IsMain)?.Url,
                Photos = user.Photos,
                Bio = user.Bio,
                FollowersCount = user.Followers.Count(),
                FollowingCount = user.Followings.Count()
            };

            if (currentUser.Followings.Any(x => x.TargetId == user.Id))
                profile.IsFollowed = true;
            return profile;
        }
    }
}