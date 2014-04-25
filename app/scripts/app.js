'use strict';

angular
  .module('grapheneSemsApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'sg.graphene',
    'ui.bootstrap',
    'ui.jq',
    'stanleygu.spinners'
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
