angular.module( 'datatron.search', [
  'ui.router',
  'placeholders',
  'ui.bootstrap',
  'datatron.search.searchbox'
])

// config for defining controller and template
.config(function config( $stateProvider ) {
  $stateProvider.state( 'search', {
    url: '/search',
    views: {
      "main": {
        controller: 'SearchCtrl',
        templateUrl: 'search/search.tpl.html'
      }
    },
    data:{ pageTitle: 'Search' }
  });
})

.controller( 'SearchCtrl', function SearchCtrl( $scope, Solstice ) {
    
    // $scope vars
    $scope.searchResult = "No Results";
    $scope.facetResult = "No Results";

    $scope.availableSearchParams = [
          { key: "name", name: "Name", placeholder: "Name..." },
          { key: "city", name: "City", placeholder: "City..." },
          { key: "country", name: "Country", placeholder: "Country..." },
          { key: "emailAddress", name: "E-Mail", placeholder: "E-Mail..." },
          { key: "phone", name: "Phone", placeholder: "Phone..." }
        ];
        
    // $scope functions
    
    // search all terms
    $scope.searchAll = function() {
        var queries = [];
        
        var query = "";
        $scope.searchResult = {};
        $scope.facetResult = {};
        
        //searchParams
        angular.forEach($scope.searchParams, function(values, key) {
            switch(key) {
                case "query":
                   angular.forEach(values, function(val) {
                      query = "description:" + val; 
                      queries.push(query);
                   });
                   break;
                case "emailAddress":
                   break;
                default:
            }
            
         });
         
         var docs;
         var facets;
         
         // break down each query into separate calls to SOLR
         angular.forEach(queries, function(val) {
             Solstice.search({
                q: val,
                //fl: 'title, teaser, published',
                //sort: 'published desc',
                facet: true,
                "facet.field": "description",
                rows: 10
            })
            .then(function (result){
                console.log(result.data);
                docs = result.data.response.docs;
                facets = result.data.facet_counts.facet_fields;
                key = val.substr(val.indexOf(':')+1,val.length);
                if (docs.length > 0) {
                    $scope.searchResult[key] = docs;
                    $scope.facetResult[key] = facets;
                } else {
                    $scope.searchResult[key] = "No Results Found!";
                    $scope.facetResult[key] = "No Results Found!";
                }
            });
         });

    };
    
    
});

