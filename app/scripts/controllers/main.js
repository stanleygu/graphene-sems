'use strict';

angular.module('grapheneSemsApp')
  .controller('MainCtrl', function($scope, $http, $log) {

    /*
     * Scope parameters that can be modified
     */
    $scope.zoom = true;
    $scope.width = 1300;
    $scope.height = 1000;
    $scope.charge = -1000;
    $scope.gravity = 0.0;
    $scope.linkDistance = 5;

    /*
     * Event listeners
     */

    var OPACITY = {
      focused: 1,
      unfocused: 0.1,
      normal: 1
    };

    var clickNode = function(node) {
      console.log('Clicked on ' + node.name);
    };

    var dblClickNode = function(node) {
      console.log('Double clicked on ' + node.name);
    };

    var mouseoverNode = function(node, scope, event) {

      var el = event.target;
      $log.info('mousing over', el);

      node.opacity = OPACITY.focused;
      _.each(scope.imports.nodes, function(n) {
        if (n.data.id !== node.data.id) {
          n.opacity = OPACITY.unfocused;
        }
      });

      _.each(scope.imports.edges, function(edge) {
        if (edge.source.data.id !== node.data.id && edge.target.data.id !== node.data.id) {
          edge.opacity = OPACITY.unfocused;
        } else {
          edge.opacity = OPACITY.focused;
          edge.target.opacity = OPACITY.focused;
          edge.source.opacity = OPACITY.focused;
        }
      });
    };

    var mouseleaveNode = function(node, scope) {
      _.each(scope.imports.nodes, function(n) {
        n.opacity = OPACITY.normal;
      });
      _.each(scope.imports.edges, function(edge) {
        edge.opacity = OPACITY.normal;
      });
    };

    $scope.events = {
      click: clickNode,
      dblClick: dblClickNode,
      mouseover: mouseoverNode,
      mouseleave: mouseleaveNode
    };
    /*
     * Dropzone config
     */
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

            if (_.contains(n.classes, 'reaction')) {
              n.width = 22;
              n.height = 22;
            } else {
              n.width = 60;
              n.height = 20;
            }
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

        $scope.force = d3.layout.force()
          .charge($scope.charge || -700)
          .linkDistance($scope.linkDistance || 40)
          .gravity($scope.gravity || 0.1)
          .size([$scope.width || 800, $scope.height || 800]);

        var throttledDigest = _.throttle(function() {
          $scope.$digest();
        }, 500);
        $scope.force
          .nodes(nodes)
          .links(edges)
          .on('tick', function() {
            throttledDigest();
          })
          .start();

        $scope.exports = {
          nodes: nodes,
          edges: edges,
          force: $scope.force,
          nodeLookup: nodeLookup,
          edgeLookup: edgeLookup,
          zoom: $scope.zoom,
          events: $scope.events,
          allowUnstick: true
        };
      }
    });
    var watchList = ['charge', 'linkDistance', 'gravity'];
    _.each(watchList, function(w) {
      $scope.$watch(w, function(newVal) {
        if (newVal) {
          if ($scope.force) {
            $log.info('Change %s to ' + newVal, w);
            $scope.force[w](newVal).start();
          }
        }
      });
    });

  });
