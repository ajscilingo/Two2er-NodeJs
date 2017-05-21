'use strict';

angular.module('exampleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('bookings', {
        url: '/bookings',
        templateUrl: 'bookings/bookings.html',
        controller: 'BookingsCtrl',
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
  .controller('BookingsCtrl', function ($scope, $http, $timeout, $user, $location) {
    $scope.saving = false;
    $scope.saved = false;
    $scope.error = null;

    // callback for ng-click 'editBooking':
    $scope.editBooking = function (bookingId) {
      $location.path('/bookings-edit/' + bookingId);
    };

    // callback for ng-click 'deleteBooking':
    $scope.deleteBooking = function (bookingId) {
      $http({
        method: 'DELETE',
        url: 'apiauth/booking/deleteById/' + bookingId
      }).then(function successCallback(response) {
        $location.path('/bookings');
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });
    };

    $http({
      method: 'GET',
      url: 'apiauth/booking/all'
    }).then(function successCallback(response) {
      $scope.bookings = response.data;
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  });