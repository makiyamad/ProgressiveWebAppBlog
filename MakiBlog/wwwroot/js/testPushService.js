define(['./notificationService.js'], function(notificationService){

    var notificationUrl = '/notifications/';
    var form = document.getElementsByClassName('push-form')[0];
    
    const formToJSON = elements => [].reduce.call(elements, (data, element) => {
        data[element.name] = element.value;
        return data;
      }, {});

    function bindSendNotification(){

        form.addEventListener('submit', function(e){
            e.preventDefault();

            var alertBox = document.querySelector('.push-response');

            notificationService.checkPushEnabled()
                .then(function(enabled){

                    alertBox.classList.remove("invisible");

                    if(!enabled){
                        alertBox.textContent = 'push enabled is: ' + enabled;
                        alertBox.classList.remove("alert-success");
                        alertBox.classList.add("alert-warning");
                        return;
                    }

                    var formSerialized = formToJSON(form.elements);

                    return fetch(notificationUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formSerialized)
                    }).then(function(){
                        alertBox.textContent = 'notification was sent successfully';
                        alertBox.classList.remove("alert-warning");
                        alertBox.classList.add("alert-success");                        
                    });

                });
        });
    }

    return {
        bindSendNotification
    }
});