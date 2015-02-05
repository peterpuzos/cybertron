angular.module( 'datatron', [
  'templates-app',
  'templates-common',
  'datatron.home',
  'datatron.search',
  'ui.router',
  'solstice'
])

.config( function datatronConfig ( $stateProvider, $urlRouterProvider, SolsticeProvider) {
  $urlRouterProvider.otherwise( '/home' );
  
  SolsticeProvider.setEndpoint('http://quickstart.cloudera:8983/solr/jobs_demo_shard1_replica1');
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

