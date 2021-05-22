var blogService = require('./blogService.js');
var testPushService = require('./testPushService.js');
var serviceWorker = require('./swRegister.js');
var localization = require('./localization.js');
var gyroscope = require('./gyroscope.js');

//window events
let defferedPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    defferedPrompt = e;
    //atualizar a tela para notificar o usuario
    // que ele pode adicionar à tela de home
    $('#install-container').show();
});

window.addEventListener('appinstalled', (evt) => {
    console.log('app foi adicionada na home screen! Yuhuu!');
});

if ('BackgroundFetchManager' in self) {
    console.log('this browser supports Background Fetch!');
}

window.pageEvents = {
    loadBlogPost: function (link, size) {
        console.log('loadBlogPost');
        blogService.loadBlogPost(link, size);
    },
    loadMoreBlogPosts: function () {
        blogService.loadMoreBlogPosts();
    },
    tryAddHomeScreen: function () {
        defferedPrompt.prompt();
        defferedPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome == 'accepted') {
                console.log('Usuário aceitou o A2HS prompt');
                $('#install-container').hide();
            }
            defferedPrompt = null;
        });
    },
    setBackgroundFetch: function (link, size) {
        navigator.serviceWorker.ready.then(async (swReg) => {

            //receive confirmation message 
            navigator.serviceWorker.addEventListener('message', event => {
                $('.download-response').html('msg : ' + event.data.msg + ' url: ' + event.data.url);
                console.log(event.data.msg, event.data.url);
            });

            var date = new Date();
            var timestamp = date.getTime();
            
            if(size == 0) {
                console.log('no video to download');
                return;
            }

            const bgFetch = await swReg.backgroundFetch.fetch(link,
                [`/assets/videos/${link}.mp4`]
                , {
                    downloadTotal: size * 1024 * 1024,
                    title: 'download post',
                    icons: [{
                        sizes: '72x72',
                        src: 'images/icons/icon-72x72.png',
                        type: 'image/png',
                    }]
                });

            bgFetch.addEventListener('progress', () => {
                if (!bgFetch.downloadTotal) return;

                const percent = Math.round(bgFetch.downloaded / bgFetch.downloadTotal * 100);
                console.log('Download progress: ' + percent + '%');
                console.log('Download status: ' + bgFetch.result);

                $('.download-start').hide();
                $('#status-download').show();
                $('#status-download > .progress > .progress-bar').css('width', percent + '%');

                if (bgFetch.result === 'success') {

                    $('#status-download > .text-success').show();
                }
            });
        });
    },
    requestPushPermission: function () {
        serviceWorker.requestPushPermission();
    },
    getGeolocation: function(){
        localization.getGeolocation();
    },
    vibrate: function(){
        if ("vibrate" in navigator) {
            // vibration API supported
            navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
            navigator.vibrate([1000]);
        }
    },
    payment: function(){

        function initPaymentRequest(onSuccess, onFailure){

            let request = new PaymentRequest([{
                supportedMethods: 'basic-card',
                data: {
                    supportedNetworks: ['visa','mastercard'],
                    supportedTypes: ['debit','credit']
                }
            }], {
                id: 'buy-me-juice',
                displayItems: [{
                    label: 'Buy me a juice',
                    amount: { currency: 'USD', value: '1.00'}
                }],
                total: { 
                    label: 'Total',
                    amount: { currency: 'USD', value: '1.00'}
                }
            });

            if (request.canMakePayment) {
                request.canMakePayment().then(function(result) {
                    if (result) {
                        onSuccess(request);
                    } else {
                        onFailure('Cannot make payment');
                    }
                }).catch(function(err) {
                    onSuccess(request, err);
                });
            } else {
                onSuccess(
                    request, 'This browser does not support "can make payment" query');
            }
        }

        function sendPaymentToServer(response){
            //send to server
            return fetch('/Pay', {method : 'POST', body: JSON.stringify(response) }).then(function(){
                console.log('pay persisted in the server');
            });
        }

        initPaymentRequest(function(request, warning){
            document.querySelector('.payment-response').innerHTML = 'success! ' + warning;

            request.show().then(function(instrumentResponse) {
                sendPaymentToServer(instrumentResponse).then(function(){
                    instrumentResponse.complete('success')
                        .then(function() {
                            alert('payment done');
                         });                    
                });
            })
            .catch(function(err) {
                document.querySelector('.payment-response').innerHTML = err;
            });

        }, function(error){
            console.log(error);
        });
    },
    copy: function(){
        var inputEl = document.querySelector('#copy-and-paste');
        var writeBtn = document.querySelector('#copyBtn');
        const inputValue = inputEl.value.trim();
        if (inputValue) {
          navigator.clipboard.writeText(inputValue)
            .then(() => {
              inputEl.value = '';
              if (writeBtn.innerText !== 'Copied!') {
                const originalText = writeBtn.innerText;
                writeBtn.innerText = 'now, the text is copied!';
                setTimeout(() => {
                  writeBtn.innerText = originalText;
                }, 2500);
              }
            })
            .catch(err => {
              console.log('Something went wrong', err);
            })
        }
    },
    paste: function(){        
        navigator.permissions
            .query({name: "clipboard-read"}).then(result => {
                var copyInput = document.querySelector('#copy-and-paste');
                navigator.clipboard.readText().then(text => copyInput.value = text);
          });
    }
};

blogService.loadLatestBlogPosts();
testPushService.bindSendNotification();
gyroscope.init();
gyroscope.animate();

