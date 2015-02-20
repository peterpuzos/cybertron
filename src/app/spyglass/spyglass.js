angular.module( 'cybertron.spyglass', [
  'ui.router',
  'ncy-angular-breadcrumb',
  'gridster',
  'flow'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'spyglass', {
    url: '/spyglass',
    views: {
      "main": {
        controller: 'SpyglassCtrl',
        templateUrl: 'spyglass/spyglass.tpl.html'
      }
    },
    data:{ pageTitle: 'Spyglass' },
    ncyBreadcrumb: { label: 'Spyglass', parent: 'home'}
  });
})

.filter('object2Array', function() {
	return function(input) {
		var out = [];
		for (var i in input) {
			out.push(input[i]);
		}
		return out;
	};
})

.controller( 'SpyglassCtrl', function SpyglassController( $scope, $timeout ) {
    
    $scope.gridsterOptions = {
        margins: [20, 20],
        columns: 4,
        draggable: {
                handle: '.box-header'
        }
    };

    $scope.dashboards = {
            '1': {
                    id: '1',
                    name: 'Search',
                    widgets: [{
                            col: 0,
                            row: 0,
                            sizeY: 1,
                            sizeX: 1,
                            icon: "fa fa-cloud-upload",
                            name: "Upload"
                    },
                    {
                            col: 1,
                            row: 0,
                            sizeY: 1,
                            sizeX: 2,
                            icon: "fa fa-file-image-o",
                            name: "Image"
                    },
                    {
                            col: 4,
                            row: 0,
                            sizeY: 1,
                            sizeX: 1,
                            icon: "fa fa-twitch",
                            name: "Faces"
                    }]
            },
            '2': {
                    id: '2',
                    name: 'Ingest',
                    widgets: [{
                            col: 1,
                            row: 1,
                            sizeY: 1,
                            sizeX: 2,
                            name: "Upload"
                    }, {
                            col: 1,
                            row: 3,
                            sizeY: 1,
                            sizeX: 1,
                            name: "Other Widget 2"
                    }]
            }
    };

    $scope.clear = function() {
            $scope.dashboard.widgets = [];
    };

    $scope.addWidget = function() {
            $scope.dashboard.widgets.push({
                    name: "New Widget",
                    sizeX: 1,
                    sizeY: 1
            });
    };

    $scope.$watch('selectedDashboardId', function(newVal, oldVal) {
            if (newVal !== oldVal) {
                    $scope.dashboard = $scope.dashboards[newVal];
            } else {
                    $scope.dashboard = $scope.dashboards[1];
            }
    });

    // init dashboard
    $scope.selectedDashboardId = '1';
    
})

.controller('CustomWidgetCtrl', function CustomWidgetCtrl($scope, $modal) {

    $scope.remove = function(widget) {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
    };

    $scope.openSettings = function(widget) {
            $modal.open({
                    scope: $scope,
                    templateUrl: 'demo/dashboard/widget_settings.html',
                    controller: 'WidgetSettingsCtrl',
                    resolve: {
                            widget: function() {
                                    return widget;
                            }
                    }
            });
    };

});

