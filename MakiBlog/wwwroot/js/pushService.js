define([], function(){

    var notificationUrl = '/Home/SendNotification/';

    function bindSendNotification(responseDiv){
        fetch(notificationUrl)
            .then(function(){
                $(responseDiv).html('notification was sent successfully');
        });
    }

    return {
        bindSendNotification
    };
});