'use strict';

angular.module('exampleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('stormpath-users-edit', {
        url: '/stormpath-users-edit/:id',
        templateUrl: 'stormpath-users/stormpath-users-edit.html',
        controller: 'StormpathUsersEditCtrl',
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
  .controller('StormpathUsersEditCtrl', function ($scope, $http, $timeout, $user, $stateParams, $location) {
    $scope.saving = false;
    $scope.saved = false;
    $scope.error = null;
    
    // callback for ng-click 'updateUser':
    $scope.updateUser = function () {
      var data = $scope.user;
      data.user_id = $stateParams.username;

      $http({
        method: 'POST',
        url: 'apiauth/stormpathusers',
        data: data
      }).then(function successCallback(response) {
        $location.path('/stormpath-users');
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });
    };

    // callback for ng-click 'cancel':
    $scope.cancel = function () {
      $location.path('/stormpath-users');
    };

    $http({
      method: 'GET',
      url: 'apiauth/stormpathusers/' + $stateParams.id
    }).then(function successCallback(response) {
      $scope.user = response.data;
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  });