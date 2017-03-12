const request = require('supertest');

// using nodejs's built-in assert
const assert = require('assert');

var sp = require('stormpath');

describe('Running stormpath tests\n', function () {
    this.timeout(10000);

    it('Test creating, logging in, and deleting Stormpath account', function testPath(done) {
        var accountData = {
            givenName: 'Homer',
            surname: 'Simpson',
            username: 'homer@test.com',
            email: 'homer@test.com',
            password: 'Password123!'
        };

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

            application.createAccount(accountData, function (err, account) {
                if (err) {
                    return console.error(err);
                }

                console.log('Created account %s', account.fullName);

                assert.equal(account.fullName, "Homer Simpson");

                var authenticator = new sp.OAuthAuthenticator(application);

                authenticator.authenticate({
                    body: {
                        grant_type: 'password',
                        username: 'homer@test.com',
                        password: 'Password123!'
                    }
                },
                function (err, result) {
                    var token = result.accessTokenResponse.access_token;

                    request(server)
                        .post('/apiauth/users')
                        .set('Authorization', 'Bearer ' + token)
                        .send({
                            name: 'Homer Simpson',
                            email: 'homer@test.com',
                            age: '100',
                            location: {
                                coordinates: [10, 10],
                                type: 'Point'
                            }
                        })
                        .end(done);

                    request(server)
                        .get('/apiauth/users/deleteByEmail/homer@test.com')
                        .set('Accept', 'application/json')
                        .set('Authorization', 'Bearer ' + token)
                        .expect(200, function (err, res) {
                            if (err) return done(err);
                            done();
                        });
                });
            });
        });

        done();
    });
});