define(['./notificationService.js'], function (notificationService) {

let _serviceWorkerRegistration;

function requestPermission() {
    return new Promise(function (resolve, reject) {
        const permissionResult = Notification.requestPermission(function (result) {
            // Handling deprecated version with callback.
            resolve(result);
        });

        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    });
}

function subscribe() {
    notificationService.retrievePublicKey().then(function (key) {
        //registrando push notification
        var subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: key
        };

        return _serviceWorkerRegistration.pushManager.subscribe(subscribeOptions)
            .then(function (pushSubscription) {
                notificationService.storePushSubscription(pushSubscription)
                    .then(function (response) {
                        if (response.status === 201) {
                            console.log('subscrito nas notificacoes push');
                        } else if (response.status === 204) {
                            console.log('notificacoes push ja estao registradas');
                        } else {
                            console.log('falhou para se subscrever');
                        }
                        $('#notification-subscribe-section').hide();
                    }).catch(function (error) {
                        console.log('falhou para armazenar subscricao: ' + error);
                    });

            });
    });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
        // registrado com sucesso
        console.log('ServiceWorker registrado com sucesso no escopo: ', registration.scope);
        _serviceWorkerRegistration = registration;

        if ('PushManager' in window) {
            console.log('this browser supports push manager');
            notificationService.saveRegistration(_serviceWorkerRegistration);
            notificationService.checkPushEnabled();
        }

    }, function (err) {
        // registro falhou
        console.log('falha no registro do ServiceWorker: ', err);
    });
}

    return {
        requestPushPermission: function () {
            requestPermission().then(function (permissionResult) {
                if (permissionResult !== 'granted')
                    throw new Error('Permission not granted.');

                subscribe();
            })
        }
    }
});