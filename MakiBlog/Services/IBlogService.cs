using System.Collections.Generic;
using MakiBlog.Models;

namespace MakiBlog.Services
{
    public interface IBlogService
    {
        List<BlogPost> GetLatestPosts();
        string GetPostText(string link);

        List<BlogPost> GetOlderPosts(int oldestPostId);
    }
}