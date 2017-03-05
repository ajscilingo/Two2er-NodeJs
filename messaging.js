const gcm = require('node-gcm');

// Set up Sender with Google Cloud Messaging API Key
const sender = new gcm.Sender('AAAAmDX3iUY:APA91bHOtkey6pXpiURB1mvWKOf-Dgg5lcbuR4LFyVTqSwa2VOAciMH7_Xu8MQQUDw_hnH-omMeQpjA23Q3sTCnKuBxXp1r-6JpjhG_rx633ZTaofMjDE0TQjK_ZuyT0DbUFVGwBhK_X');

function sendBookingNotificationToUser(user_id, booking_id, status){
    
    // Set up Message to be sent    
    var message = new gcm.Message();
}