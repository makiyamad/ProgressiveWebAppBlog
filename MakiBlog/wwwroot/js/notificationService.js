define([], function () {
    self = this;
    self.serviceWorkerRegistration = {};

    //ref https://www.tpeczek.com/2018/01/push-notifications-and-aspnet-core-part_18.html
    function urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    return {
        retrievePublicKey: function () {
            return fetch('/publickey').then(function (response) {
                if (response.ok) {
                    return response.text().then(function (applicationServerPublicKeyBase64) {
                        return urlB64ToUint8Array(applicationServerPublicKeyBase64);
                    });
                } else {
                    return Promise.reject(response.status + ' ' + response.statusText);
                }
            });
        },
        storePushSubscription: function (pushSubscription) {
            return fetch('/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pushSubscription)
            });
        },
        discardPushSubscription: function (pushSubscription) {
            return fetch('/subscriptions?endpoint=' + encodeURIComponent(pushSubscription.endpoint), {
                method: 'DELETE'
            });
        },
        checkPushEnabled: function () {
            return self.serviceWorkerRegistration
                .pushManager
                .getSubscription()
                .then(function (subscription) {

                    if (Notification.permission === "granted" && subscription != null) {
                        console.log('permission ja foi concedida para push notification');
                        return Promise.resolve(true);
                    }

                    console.log('subscription not enabled - service worker permission could be revoked');
                    
                    $('#notification-subscribe-section').show();
                    return Promise.resolve(false);
                });
        },
        saveRegistration : function(registration){
            self.serviceWorkerRegistration = registration;
        }
    };
});