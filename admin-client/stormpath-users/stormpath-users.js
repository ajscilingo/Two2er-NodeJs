'use strict';

angular.module('exampleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('stormpath-users', {
        url: '/stormpath-users',
        templateUrl: 'stormpath-users/stormpath-users.html',
        controller: 'StormpathUsersCtrl',
        /**
         * The Stormpath Angular SDK provides a configuration block that informs
         * UI router about protected routes.  When we use `authenticate: true`,
         * the user will be redirected to the login page if they try to access
         * this view but are not logged in.
         */
        sp: {
          authenticate: true
        }
      });
  })
  .controller('StormpathUsersCtrl', function ($scope, $http, $timeout, $user) {
    $scope.saving = false;
    $scope.saved = false;
    $scope.error = null;
    
    $http({
      method: 'GET',
        url: 'apiauth/stormpathusers/'
      }).then(function successCallback(response) {
          $scope.users = response.data;
        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
  });