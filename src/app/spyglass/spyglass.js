angular.module( 'cybertron.spyglass', [
  'ui.router',
  'ncy-angular-breadcrumb',
  'gridster',
  'angularFileUpload'
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
                            sizeY: 2,
                            sizeX: 1,
                            icon: "fa fa-cloud-upload",
                            name: "Upload"
                    },
                    {
                            col: 1,
                            row: 0,
                            sizeY: 2,
                            sizeX: 2,
                            icon: "fa fa-file-image-o",
                            name: "Image"
                    },
                    {
                            col: 4,
                            row: 0,
                            sizeY: 2,
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

.controller('ImageUploadCtrl', function CustomWidgetCtrl($scope, $modal, $upload) {
    
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    
    $scope.upload = function (files) {
        if (files && files.length) {
            angular.forEach(files, function(file) {
                $upload.upload({
                    url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                    fields: {
                        'username': $scope.username
                    },
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total, 10);
                    console.log('progress: ' + progressPercentage + '% ' +
                                evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' +
                                JSON.stringify(data));
                });
            });
        }
    };

    $scope.remove = function(widget) {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
    };

    $scope.openSettings = function(widget) {
            $modal.open({
                    scope: $scope,
                    templateUrl: '',
                    controller: 'WidgetSettingsCtrl',
                    resolve: {
                            widget: function() {
                                    return widget;
                            }
                    }
            });
    };

});

