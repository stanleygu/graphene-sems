'use strict';

angular
  .module('grapheneSemsApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'sg.graphene',
    'ui.bootstrap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
