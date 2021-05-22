using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Lib.Net.Http.WebPush;
using MakiBlog.Store;
using Microsoft.Extensions.Logging;
using System.Net;

namespace MakiBlog.Services
{

    public class PushService : IPushService
    {
        private readonly PushServiceClient _pushClient;
        private readonly IPushSubscriptionStore _subscriptionStore;

        private readonly ILogger<IPushService> _logger;

        private readonly IPushSubscriptionStoreAccessorProvider _subscriptionStoreAccessorProvider;

        public PushService(PushServiceClient pushClient, IPushSubscriptionStore subscriptionStore, 
        ILogger<IPushService> logger, IPushSubscriptionStoreAccessorProvider subscriptionStoreAccessorProvider)
        {
            _pushClient = pushClient;
            _subscriptionStore = subscriptionStore;
            _logger = logger;
            _subscriptionStoreAccessorProvider = subscriptionStoreAccessorProvider;
        }

        public string GetKey()
        {
            return _pushClient.DefaultAuthentication.PublicKey;
        }

        public async void SendNotificationAsync(PushMessage message)
        {

            await _subscriptionStore.ForEachSubscriptionAsync(async (subscription) =>
            {
                try
                {
                    await _pushClient.RequestPushMessageDeliveryAsync(subscription, message);
                }
                catch (Exception ex)
                {
                    await HandlePushMessageDeliveryException(ex, subscription);
                }
            });
        }

        public async Task<int> StoreSubscriptionAsync([FromBody] PushSubscription subscription)
        {
            return await _subscriptionStore.StoreSubscriptionAsync(subscription);
        }

        public async Task DiscardSubscriptionAsync(string endpoint)
        {
            await _subscriptionStore.DiscardSubscriptionAsync(endpoint);
        }
        private async Task HandlePushMessageDeliveryException(Exception exception, PushSubscription subscription)
        {
            PushServiceClientException pushServiceClientException = exception as PushServiceClientException;

            if (pushServiceClientException is null)
            {
                _logger?.LogError(exception, "Failed requesting push message delivery to {0}.", subscription.Endpoint);
            }
            else
            {
                if (pushServiceClientException.StatusCode == HttpStatusCode.NotFound
                || pushServiceClientException.StatusCode == HttpStatusCode.Gone)
                {
                    using (IPushSubscriptionStoreAccessor subscriptionStoreAccessor = 
                        _subscriptionStoreAccessorProvider.GetPushSubscriptionStoreAccessor())
                    {
                        await subscriptionStoreAccessor.PushSubscriptionStore.DiscardSubscriptionAsync(subscription.Endpoint);
                    }

                    _logger?.LogInformation("Subscription has expired or is no longer valid and has been removed.");
                }
            }
        }

    }
}
