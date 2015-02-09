angular.module( 'datatron.search', [
  'ui.router',
  'placeholders',
  'ui.bootstrap',
  'datatron.search.searchbox',
  'solstice',
  'angularCharts'
])

// config for defining controller and template
.config(function config( $stateProvider, SolsticeProvider) {
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
  
  SolsticeProvider.setEndpoint('http://quickstart.cloudera:8983/solr/jobs_demo_shard1_replica1');
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
        
    
    
    // search all terms
    $scope.searchAll = function() {
        
        // Variables For Queries and Search
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
         
         $scope.graphResults = [];
         var docs;
         var facets;
         var graphResult = {};
         var slice;
         
         // break down each query into separate calls to SOLR
         angular.forEach(queries, function(val) {
             Solstice.search({
                q: val,
                //fl: 'title, teaser, published',
                //sort: 'published desc',
                facet: true,
                "facet.field": "description",
                "facet.mincount": 1,
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
                    $scope.searchResult[key] = null;
                    $scope.facetResult[key] = null;
                }
                
                graphResult = {};
                angular.forEach($scope.facetResult, function(facetVal, searchTerm) {
                if (facetVal) {
                    graphResult.chTitle = searchTerm;

                    angular.forEach(facetVal, function(terms, facet) {
                        graphResult.chConfig = {
                            "title": facet,
                            tooltips: true,
                            labels: false,
                            mouseover: function() {},
                            mouseout: function() {},
                            click: function() {},
                            legend: {
                              display: true,
                              //could be 'left, right'
                              position: 'right'
                            }
                        };
                        graphResult.chData = [];
                        slice = {};
                        for (var i=0; i<terms.length; i++) {
                            if ( (i+2)%2 === 0) {
                                slice.x = terms[i];
                            } else {
                                slice.y = terms[i];
                                graphResult.chData.push(slice);
                                slice = {};
                            }
                        }
                    });
                    $scope.graphResults.push(graphResult);
                }
            });
            });
         });
         
//        $scope.chartConfig = {
//            "title": "Products",
//            tooltips: true,
//            labels: false,
//            mouseover: function() {},
//            mouseout: function() {},
//            click: function() {},
//            legend: {
//              display: true,
//              //could be 'left, right'
//              position: 'right'
//            }
//        };
//        $scope.data = {
//            data: [{
//              x: "Laptops",
//              y: [100]
//            }, {
//              x: "Desktops",
//              y: [300]
//            }, {
//              x: "Mobiles",
//              y: [351]
//            }, {
//              x: "Tablets",
//              y: [54]
//            }]
//        };

    };
    
    
});

