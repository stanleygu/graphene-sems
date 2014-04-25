'use strict';

describe('Controller: LayoutCtrl', function () {

  // load the controller's module
  beforeEach(module('grapheneSemsApp'));

  var LayoutCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LayoutCtrl = $controller('LayoutCtrl', {
      $scope: scope
    });
  }));

  it('should be true', function () {
    expect(true).toBe(true);
  });
});
