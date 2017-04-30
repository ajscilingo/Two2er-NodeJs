'use strict';

angular.module('exampleApp', [
  'ui.router',
  'stormpath',
  'stormpath.templates'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, STORMPATH_CONFIG) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);

    /**
     * We want to authenticate the requests to our local profile route, adding it
     * to this list tells Stormpath to automatically add the Authorization header
     * when sending requests to that URL.
     */
    STORMPATH_CONFIG.AUTO_AUTHORIZED_URIS.push('/profile');
    STORMPATH_CONFIG.AUTO_AUTHORIZED_URIS.push('/users');
    STORMPATH_CONFIG.AUTO_AUTHORIZED_URIS.push('/users-edit');
    STORMPATH_CONFIG.AUTO_AUTHORIZED_URIS.push('/stormpath-users');
  })
  .run(function($stormpath,$rootScope,$state){

    /*
      In this example we use UI router, and this
      is how we tell the Stormpath module which
      states we would like to use to use for login
      and post-login
     */

    $stormpath.uiRouter({
      loginState: 'login',
      defaultPostLoginState: 'home'
    });

    /*
      We want to redirect users back to the home
      state after they logout, so we watch for the
      logout event and then transition them to the
      login state
     */
    $rootScope.$on('$sessionEnd',function () {
      $state.transitionTo('home');
    });
  });