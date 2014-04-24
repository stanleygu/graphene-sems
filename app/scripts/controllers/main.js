'use strict';

angular.module('grapheneSemsApp')
  .controller('MainCtrl', function($scope, $http, $log) {
    $scope.dropzoneConfig = {
      init: function() {
        this.on('addedfile', function(file) {
          var fr = new FileReader();
          fr.onload = function() {
            $scope.data = angular.fromJson(fr.result);
            $scope.$apply();
          };
          fr.readAsText(file);
        });
      },
      url: '/',
      autoProcessQueue: false,
      error: function(file, responseText, e) {
        console.log('Error! ', e);
      }
    };

    $http.get('sample.json').success(function(data) {
      $scope.data = data;
    });

    $scope.$watch('data', function(newVal) {
      if (newVal) {
        $log.info('Received new network', newVal);
        var nodes = [];
        var edges = [];
        var nodeLookup = {};
        var edgeLookup = {};

        _.each($scope.data.elements.nodes, function(n) {
          if (_.contains(n.classes, 'reaction') || _.contains(n.classes, 'species')) {
            nodeLookup[n.data.id] = n;
            edgeLookup[n.data.id] = {
              to: [],
              from: []
            };
            nodes.push(n);
          }
        });

        _.each($scope.data.elements.edges, function(e) {
          var source = nodeLookup[e.data.source];
          var target = nodeLookup[e.data.target];
          if (source && target) {
            // makes sure that source and target is in the graph
            e.source = source;
            e.target = target;
            edges.push(e);
            edgeLookup[source.data.id].from.push(e);
            edgeLookup[target.data.id].to.push(e);
          }
        });

        var force = d3.layout.force()
          .charge($scope.charge || -700)
          .linkDistance($scope.linkDistance || 40)
          .gravity($scope.gravity || 0.1)
          .size([$scope.width || 800, $scope.height || 800]);

        force
          .nodes(nodes)
          .links(edges)
          .on('tick', function() {
            $scope.$digest();
          })
          .start();

        $scope.exports = {
          nodes: nodes,
          edges: edges,
          force: force,
          nodeLookup: nodeLookup,
          edgeLookup: edgeLookup
        };
      }
    });
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
