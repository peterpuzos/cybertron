angular.module( 'datatron', [
  'templates-app',
  'templates-common',
  'datatron.home',
  'datatron.search',
  'ui.router'
])

.config( function datatronConfig ( $stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise( '/home' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | DataTron' ;
    }
  });
})

;

