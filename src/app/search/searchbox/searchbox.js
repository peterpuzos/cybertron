angular.module( 'datatron.search.searchbox' , [])

.directive('nitAdvancedSearchbox', function() {
        return {
            restrict: 'E',
            scope: {
                model: '=ngModel',
                parameters: '=',
                searchAll: '=searchAll'
            },
            replace: true,
            templateUrl: 'search/searchbox/searchbox.tpl.html',
            controller: [
                '$scope', '$attrs', '$element', '$timeout', '$filter',
                function ($scope, $attrs, $element, $timeout, $filter) {

                    $scope.placeholder = $attrs.placeholder || 'Search ...';
                    $scope.searchParams = [];
                    
                    $scope.searchQuery = '';
                    $scope.setSearchFocus = false;
                    
                    var defaultParam = { key: "query", name: "Query", placeholder: "Query..." };
                    
//                    $scope.$watch('searchQuery', function () {
//                        updateModel();
//                    });

//                    $scope.$watch('searchParams', function () {
//                        updateModel();
//                    }, true);

                    $scope.enterEditMode = function(index) {
                        if (index === undefined) {
                            return;
                        }
                        var searchParam = $scope.searchParams[index];
                        searchParam.editMode = true;
                    };

                    $scope.leaveEditMode = function(index) {
                        if (index === undefined) {
                            return;
                        }
                        var searchParam = $scope.searchParams[index];
                        searchParam.editMode = false;
                            
                        // remove empty search params
                        if (!searchParam.value) {
                            $scope.removeSearchParam(index);
                        }
                        updateModel();
                    };

                    $scope.typeaheadOnSelect = function (item, model, label) {
                        $scope.addSearchParam(item);
                        $scope.searchQuery = '';
                    };

                    $scope.addSearchParam = function (searchParam, value, enterEditModel) {
                        if (enterEditModel === undefined) {
                            enterEditModel = true;
                        }
                            
                        $scope.searchParams.push(
                            {
                                key: searchParam.key,
                                name: searchParam.name,
                                placeholder: searchParam.placeholder,
                                value: value || '',
                                editMode: enterEditModel
                            }
                        );
                        updateModel();

                        //TODO: hide used suggestion
                    };

                    $scope.removeSearchParam = function (index) {
                        if (index === undefined) {
                            return;
                        }

                        $scope.searchParams.splice(index, 1);

                        //TODO: show hidden/removed suggestion
                    };
                    
                    $scope.removeAll = function() {
                        $scope.searchParams.length = 0;
                        $scope.searchQuery = '';
                        
                        //TODO: show hidden/removed suggestion
                    };

                    $scope.editPrevious = function(currentIndex) {
                        if (currentIndex !== undefined) {
                            $scope.leaveEditMode(currentIndex);
                        }
                        //TODO: check if index == 0 -> what then?
                        if (currentIndex > 0) {
                            $scope.enterEditMode(currentIndex - 1);
                        } else if ($scope.searchParams.length > 0) {
                            $scope.enterEditMode($scope.searchParams.length - 1);
                        }
                    };

                    $scope.editNext = function(currentIndex) {
                        if (currentIndex === undefined) {
                            return;
                        }
                        $scope.leaveEditMode(currentIndex);

                        //TODO: check if index == array length - 1 -> what then?
                        if (currentIndex < $scope.searchParams.length - 1) {
                            $scope.enterEditMode(currentIndex + 1);
                        } else {
                            $scope.setSearchFocus = true;
                        }
                    };

                    $scope.keydown = function(e, searchParamIndex) {
                        var handledKeys = [8, 9, 13, 37, 39];
                        
                        if (handledKeys.indexOf(e.which) === -1) {
                            return;
                        }
                        var cursorPosition = getCurrentCaretPosition(e.target);
                        
                        if (e.which === 8) { // backspace
                            if (cursorPosition === 0) {
                                $scope.editPrevious(searchParamIndex);
                            }
                        } else if (e.which === 9) { // tab
                            if (e.shiftKey) {
                                e.preventDefault();
                                $scope.editPrevious(searchParamIndex);
                            } else {
                                e.preventDefault();
                                if (searchParamIndex < $scope.searchParams.length) {
                                    $scope.editNext(searchParamIndex);
                                } else {
                                    if (e.target.value !== '') {
                                       $scope.addSearchParam(defaultParam, e.target.value, false);
                                       e.target.value = '';
                                    }
                                }
                            }
                        } else if (e.which === 13) { // enter
                            if (searchParamIndex < $scope.searchParams.length) {
                                $scope.editNext(searchParamIndex);
                            } else {
                                if (e.target.value !== '') {
                                    $scope.addSearchParam(defaultParam, e.target.value, false);
                                    e.target.value = '';
                                }
                                // $timeout had to be used as we needed to wait for $scope to update
                                $timeout( function () {
                                    $scope.searchAll();
                                }, 0);
                            }
//                        } else if (e.which == 32) { // space
//                            e.preventDefault();
//                            $scope.addSearchParam(defaultParam, e.target.value, false);
//                            e.target.value = "";
                        } else if (e.which === 37) { // left
                            if (cursorPosition === 0) {
                                $scope.editPrevious(searchParamIndex);
                            }
                        } else if (e.which === 39) { // right
                            if (cursorPosition === e.target.value.length) {
                                $scope.editNext(searchParamIndex);
                            }
                        }
                    };

                    function restoreModel() {
                        angular.forEach($scope.model, function (value, key) {
//                            if (key === 'query') {
//                                $scope.searchQuery = value;
//                            } else {
                            var searchParam = $filter('filter')($scope.parameters, function (param) { return param.key === key; })[0];
                            if (searchParam !== undefined) {
                                $scope.addSearchParam(searchParam, value, false);
//                                }
                            }
                        });
                    }

                    if ($scope.model === undefined) {
                        $scope.model = {};
                    } else {
                        restoreModel();
                    }

                    function updateModel() {
                            $scope.model = {};
                            
                            angular.forEach($scope.searchParams, function (param) {
                                if (param.value !== undefined && param.value.length > 0) {
                                    if (param.key in $scope.model) {
                                        $scope.model[param.key].push(param.value.trim());
                                    } else { 
                                        $scope.model[param.key] = [param.value.trim()];
                                    }
                                }
                            });
                    }
                    
                    $scope.moveCursorToEnd = function(el) {
                        if (typeof el.selectionStart === "number") {
                            el.selectionStart = el.selectionEnd = el.value.length;
                        } else if (typeof el.createTextRange !== "undefined") {
                            el.focus();
                            var range = el.createTextRange();
                            range.collapse(false);
                            range.select();
                        }
                    };

                    function getCurrentCaretPosition(input) {
                        if (!input) {
                            return 0;
                        }
                        // Firefox & co
                        if (typeof input.selectionStart === 'number') {
                            return input.selectionDirection === 'backward' ? input.selectionStart : input.selectionEnd;

                        } else if (document.selection) { // IE
                            input.focus();
                            var selection = document.selection.createRange();
                            var selectionLength = document.selection.createRange().text.length;
                            selection.moveStart('character', -input.value.length);
                            return selection.text.length - selectionLength;
                        }

                        return 0;
                    }
                }
            ]
        };
   })
     
   .directive('nitSetFocus', [
        '$timeout', '$parse',
        
        function($timeout, $parse) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var model = $parse($attrs.nitSetFocus);
                    $scope.$watch(model, function(value) {
                        if (value === true) {
                            $timeout(function() {
                                var caretPos = $scope.searchParam ? $scope.searchParam.value.length : 0;
                                if ($element[0] !== null) {
                                    if ($element[0].createTextRange) {
                                        var range = $element[0].createTextRange();
                                        range.move('character', caretPos);
                                        range.select();
                                    } else {
                                        $element[0].focus();
                                        $element[0].setSelectionRange(caretPos, caretPos);
                                    }
                                }
                            });
                        }
                    });
                    $element.bind('blur', function() {
                        $scope.$apply(model.assign($scope, false));
                    });
                }
            };
        }
    ])
    
    .directive('nitAutoSizeInput', [
        function() {
            return {
                restrict: 'A',
                scope: {
                    model: '=ngModel'
                },
                link: function($scope, $element, $attrs) {
                    var container = angular.element('<div style="position: fixed; top: -9999px; left: 0px;"></div>');
                    var shadow = angular.element('<span style="white-space:pre;"></span>');

                    var maxWidth = $element.css('maxWidth') === 'none' ? $element.parent().innerWidth() : $element.css('maxWidth');
                    $element.css('maxWidth', maxWidth);

                    angular.forEach([
                        'fontSize', 'fontFamily', 'fontWeight', 'fontStyle',
                        'letterSpacing', 'textTransform', 'wordSpacing', 'textIndent',
                        'boxSizing', 'borderLeftWidth', 'borderRightWidth', 'borderLeftStyle', 'borderRightStyle',
                        'paddingLeft', 'paddingRight', 'marginLeft', 'marginRight'
                    ], function(css) {
                        shadow.css(css, $element.css(css));
                    });

                    angular.element('body').append(container.append(shadow));

                    function resize() {
                        shadow.text($element.val() || $element.attr('placeholder'));
                        $element.css('width', shadow.outerWidth() + 10);
                    }

                    resize();

                    if ($scope.model) {
                        $scope.$watch('model', function() { resize(); });
                    } else {
                        $element.on('keypress keyup keydown focus input propertychange change', function() { resize(); });
                    }
                }
            };
        }
 ]);
