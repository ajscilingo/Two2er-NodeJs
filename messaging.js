const FCM = require('fcm-push');

// Set up Sender with Google Cloud Messaging API Key
var api_key = 'AAAAmDX3iUY:APA91bHOtkey6pXpiURB1mvWKOf-Dgg5lcbuR4LFyVTqSwa2VOAciMH7_Xu8MQQUDw_hnH-omMeQpjA23Q3sTCnKuBxXp1r-6JpjhG_rx633ZTaofMjDE0TQjK_ZuyT0DbUFVGwBhK_X'
var fcm = new FCM(api_key);

module.exports = fcm;