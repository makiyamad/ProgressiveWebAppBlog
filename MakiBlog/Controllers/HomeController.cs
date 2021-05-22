using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MakiBlog.Models;
using Lib.Net.Http.WebPush;
using MakiBlog.Services;
using System.Collections.Generic;

namespace MakiBlog.Controllers
{

    public class HomeController : Controller
    {
        private IBlogService _blogService;

        private readonly IPushService _pushService;

        public HomeController(IBlogService blogService, IPushService pushService)
        {
            _blogService = blogService;
            _pushService = pushService;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        public JsonResult LatestBlogPosts()
        {
            var posts = _blogService.GetLatestPosts();
            return Json(posts);
        }

        public JsonResult MoreBlogPosts(int oldestBlogPostId)
        {
            var posts = _blogService.GetOlderPosts(oldestBlogPostId);
            return Json(posts);
        }

        public ContentResult Post(string link)
        {
            return Content(_blogService.GetPostText(link));
        }

        [HttpGet("publickey")]
        public ContentResult GetPublicKey()
        {
            return Content(_pushService.GetKey(), "text/plain");
        }

        //armazena subscricoes
        [HttpPost("subscriptions")]
        public async Task<IActionResult> StoreSubscription([FromBody]PushSubscription subscription)
        {
            int res = await _pushService.StoreSubscriptionAsync(subscription);

            if (res > 0)
                return CreatedAtAction(nameof(StoreSubscription), subscription);

            return NoContent();
        }

        [HttpDelete("subscriptions")]
        public async Task<IActionResult> DiscardSubscription(string endpoint)
        {
            await _pushService.DiscardSubscriptionAsync(endpoint);

            return NoContent();
        }

        [HttpPost("notifications")]
        public async Task<IActionResult> SendNotification([FromBody]PushMessageViewModel messageVM)
        {
            var message = new PushMessage(messageVM.Notification)
            {
                Topic = messageVM.Topic,
                Urgency = messageVM.Urgency                
            };

            _pushService.SendNotificationAsync(message);

            return NoContent();
        }

        [HttpPost("Pay")]
        public ActionResult Pay(PayRequest payment){
            return Ok();
        }
    }

    public class PayRequest{
        public int requestId { get; set; }
        public int methodName { get; set; } 
        public PaymentDetails details { get; set; }

        public string shippingAddress {get;set;}
        public string shippingOption {get;set;} 
        public string payerName {get;set;}       
        public string payerEmail {get;set;}               
        public string payerPhone {get;set;}
    }

    public class PaymentDetails{
        public BillingAddress billingAddress { get; set; }
        public string cardNumber { get; set; }
        public string cardSecurityCode { get; set; }
        public string cardholderName { get; set; }        
        public string expiryMonth { get; set; }                
        public string expiryYear { get; set; }
    }

    public class BillingAddress{
        public string[] addressLine {get;set;}
        public string city {get;set;}
        public string country {get;set;}
        public string dependentLocality { get;set;}
        public string organization { get;set;}
        public string phone { get;set;}        
        public string postalCode { get;set;}   
        public string recipient { get;set;}   
        public string region { get;set;}
        public string sortingCode { get;set;}
    }
}
