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
        margins: [10, 10],
        rowHeight: 250,
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
                            sizeY: 3,
                            sizeX: 1,
                            icon: "fa fa-folder-open",
                            name: "Files"
                    },
                    {
                            col: 1,
                            row: 0,
                            sizeY: 3,
                            sizeX: 2,
                            icon: "fa fa-file-image-o",
                            name: "Images"
                    },
                    {
                            col: 4,
                            row: 0,
                            sizeY: 3,
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

.controller('ImageUploadCtrl', function ImageUploadController($scope, $modal, $upload) {
    $scope.files = {};
    $scope.selectedFiles = {};
       
    $scope.addFiles = function(uploads) {
        angular.forEach(uploads, function(f) {
            if ((f.name in $scope.files)) {
                $scope.files[f.name].error = "Error: File already exists!";
            } else {
                $scope.files[f.name] = f;
            }
        });
    };

    $scope.removeAllFiles = function() {
        $scope.files = {};
    };
    
    $scope.removeFile = function(filename) {
        delete $scope.files[filename];
    };
    
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
    
    $scope.changeSelection = function(file) {
        if (file.$selected) {
            $scope.selectedFiles[file.name] = file;
        } else {
            delete $scope.selectedFiles[file.name];
        }
        console.info($scope.selectedFiles);
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

})

.directive('ngThumb', ['$window', function($window) {
    var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function(item) {
            return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function(file) {
            var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    };
    
    return {
        restrict: 'A',
        template: '<canvas/>',
        link: function(scope, element, attributes) {
            if (!helper.support) {return;}
            
            var params = scope.$eval(attributes.ngThumb);
            
            if (!helper.isFile(params.file)) {return;}
            if (!helper.isImage(params.file)) {return;}
            
            var canvas = element.find('canvas');
            var reader = new FileReader();
            
            reader.onload = onLoadFile;
            reader.readAsDataURL(params.file);
            
            function onLoadFile(event) {
                var img = new Image();
                img.onload = onLoadImage;
                img.src = event.target.result;
            }
            
            function onLoadImage() {
                var width = params.width || this.width / this.height * params.height;
                var height = params.height || this.height / this.width * params.width;
                canvas.attr({ width: width, height: height });
                canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
            }
        }
    };
}]);

