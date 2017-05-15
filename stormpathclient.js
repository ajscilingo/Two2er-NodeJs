const bluebird = require('bluebird');

var token = '';
var username = "max@test.com";
var password = "Password123";
//var username = "t.durden@mail.com";
//var password = "TD0627023Dp!";
//var username = "NewMaxPower@mail.com";
//var password = "Password1";
var sp = require('stormpath');
var accounts = "";

var client = new sp.Client({
    apiKey: {
        id: '1CRUFRGX863CDWSZFBLB66JS9',
        secret: '2HoQ5havQ7+tj24VwjfXKtAwPuoF/2W2NuOdSqwCMsU'
    }
});

client.getAccounts(function(err, accountsCollection) {
  this.accounts = accountsCollection.items;
});

// reference to two2erContext in stormpath
var two2erContext;

getTwo2erContext = function () {
    
    // if two2erContext not created, create it
    if(two2erContext == null){  
        
        return new Promise( function(resolve, reject) {
            client.getApplications({ name: 'Two2er' }, (err, applications) => {
                
                if(err) {
                    console.error(err);
                    reject(null);
                }
                
                two2erContext = applications.items[0];
                resolve(two2erContext);
            });
        });
    }
    else 
        return new Promise( function (resolve, reject) {
            resolve(two2erContext);
        });
}

getMyToken = function(uname = username, pword = password){
    
    return new Promise( function (resolve, reject) {
        getTwo2erContext().then( (two2erApp) => {

            var auth = new sp.OAuthAuthenticator(two2erApp);
            auth.authenticate({
                body: {
                    grant_type: 'password',
                    username: uname,
                    password: pword
                }
            }, (err, result) => {
                if(err) 
                    reject(err);
                else
                    resolve(result.accessTokenResponse.access_token);
            });

        }).catch( (error) => {
            reject(error);
        }); 
    });
}

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
        function (err, result) {
            this.token = result.accessTokenResponse.access_token;
        });
});

getToken = function () {
    return this.token;
}

getUsername = function () {
    return this.username;
}

getAccounts = function () {
    return this.accounts;
}

getAccount = function (email) {
    for (var x=0; this.accounts && x < this.accounts.length; x++) {
        var account = this.accounts[x];
        
        if (account.email == email)
            return account;
    }
}

saveAccount = function (user) {
    for (var x=0; this.accounts && x < this.accounts.length; x++) {
        var account = this.accounts[x];
        
        if (account.href == user.href) {
            console.log('update ' + user.email);
            account.givenName = user.givenName;
            account.surname = user.surname;

            account.save(function(err, savedAccount) {
                if (err) throw err;
                console.log('Updated account:' + JSON.stringify(savedAccount));
            });
        }
    }
}