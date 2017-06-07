'use strict';

angular.module('exampleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('bookings-edit', {
        url: '/bookings-edit/:id',
        templateUrl: 'bookings/bookings-edit.html',
        controller: 'BookingsEditCtrl',
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
  .controller('BookingsEditCtrl', function ($scope, $http, $timeout, $user, $stateParams, $location) {
    $scope.saving = false;
    $scope.saved = false;
    $scope.error = null;

    // callback for ng-click 'updateUser':
    $scope.updateBooking = function () {
      var data = $scope.booking;
      data.booking_id = $stateParams.id;

      $http({
        method: 'POST',
        url: 'apiauth/booking/update/',
        data: data
      }).then(function successCallback(response) {
        $location.path('/bookings');
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });
    };

    // callback for ng-click 'cancel':
    $scope.cancel = function () {
      $location.path('/bookings');
    };

    $http({
      method: 'GET',
      url: 'apiauth/booking/getBookingById/' + $stateParams.id
    }).then(function successCallback(response) {
      $scope.booking = response.data;
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  });