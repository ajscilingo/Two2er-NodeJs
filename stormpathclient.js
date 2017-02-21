var token = '';
var username = "Ksilha@gmail.com";
var password = "Password123";
var sp = require('stormpath');

var client = new sp.Client({
    apiKey: {
    id: '1CRUFRGX863CDWSZFBLB66JS9',
    secret: '2HoQ5havQ7+tj24VwjfXKtAwPuoF/2W2NuOdSqwCMsU'
    }
});

client.getApplications({ name: 'Two2er' }, function (err, applications) {
    if (err) {
        return console.error(err);
    }

    var application = applications.items[0];

    var authenticator = new sp.OAuthAuthenticator(application);

    authenticator.authenticate({
        body: {
            grant_type: 'password',
            username: username,
            password: password
        }
    }, 
    function(err, result){
        this.token = result.accessTokenResponse.access_token;
    });
});

getToken = function () {
    return this.token;
}

getUsername = function () {
    return this.username;
}