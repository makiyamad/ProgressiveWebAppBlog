using System;
using MakiBlog.Store;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
public class SqlitePushSubscriptionStoreAccessorProvider : IPushSubscriptionStoreAccessorProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IServiceProvider _serviceProvider;

    public SqlitePushSubscriptionStoreAccessorProvider(IHttpContextAccessor httpContextAccessor,
    IServiceProvider serviceProvider)
    {
        _httpContextAccessor = httpContextAccessor;
        _serviceProvider = serviceProvider;
    }

    public IPushSubscriptionStoreAccessor GetPushSubscriptionStoreAccessor()
    {
        if (_httpContextAccessor.HttpContext is null)
        {
            return new SqlitePushSubscriptionStoreAccessor(_serviceProvider.CreateScope());
        }
        else
        {
            return new SqlitePushSubscriptionStoreAccessor(
                _httpContextAccessor.HttpContext.RequestServices.GetRequiredService<IPushSubscriptionStore>());
        }
    }
}

public class SqlitePushSubscriptionStoreAccessor : IPushSubscriptionStoreAccessor
{
    public IPushSubscriptionStore PushSubscriptionStore { get; set; }
    private IServiceScope _serviceScope;
    public SqlitePushSubscriptionStoreAccessor(IServiceScope serviceScope)
    {
        _serviceScope = serviceScope;
        PushSubscriptionStore = _serviceScope.ServiceProvider.GetService<IPushSubscriptionStore>();
    }

    public SqlitePushSubscriptionStoreAccessor(IPushSubscriptionStore pushSubscriptionStore)
    {
        PushSubscriptionStore = pushSubscriptionStore;
    }

    public void Dispose()
    {
        PushSubscriptionStore = null;
        if (!(_serviceScope is null))
        {
            _serviceScope.Dispose();
            _serviceScope = null;
        }
    }
}

public interface IPushSubscriptionStoreAccessor : IDisposable
{
    IPushSubscriptionStore PushSubscriptionStore { get; }
}

public interface IPushSubscriptionStoreAccessorProvider
{
    IPushSubscriptionStoreAccessor GetPushSubscriptionStoreAccessor();
}
