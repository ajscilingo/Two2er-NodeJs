'use strict';

angular.module('exampleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('users', {
        url: '/users',
        templateUrl: 'users/users.html',
        controller: 'UsersCtrl',
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
  .controller('UsersCtrl', function ($scope, $http, $timeout, $user, $location) {
    $scope.saving = false;
    $scope.saved = false;
    $scope.error = null;

    // callback for ng-click 'editUser':
    $scope.editUser = function (userId) {
      $location.path('/users-edit/' + userId);
    };

    $http({
      method: 'GET',
      url: 'apiauth/users/'
    }).then(function successCallback(response) {
      $scope.users = response.data;
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  });