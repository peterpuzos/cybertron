angular.module( 'datatron.search', [
  'ui.router',
  'placeholders',
  'ui.bootstrap',
  'datatron.search.searchbox',
  'solstice',
  'highcharts-ng'
])

.value('setup', {
    queryField: 'record',
    facetFields: ['extension', 'app', 'subapp'],
    dateFacets: {   date:'time', 
                    date_start:'2014-05-04T00:00:00Z',
                    date_end:'2014-05-05T00:00:00Z',
                    date_gap:'+1HOUR'
                },
    width: '300',
    height: '300'
})

// config for defining controller and template
.config(function config( $stateProvider, SolsticeProvider) {
  SolsticeProvider.setEndpoint('http://quickstart.cloudera:8983/solr/log_analytics_demo_shard1_replica1');  
    
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

.controller( 'SearchCtrl', function SearchCtrl( $scope, $q, Solstice, setup) {
    
    // $scope vars
    $scope.searchResult = "No Results";
    $scope.facetResult = "No Results";
    
//    $scope.allFacets = function() {
//        Solstice.search({
//                q: '*:*',
//                facet: true,
//                rows: 0,
//                "facet.field": setup.facetFields,
//                "facet.mincount": 1,
//                "facet.date": setup.date,
//                "facet.date.start": setup.date_start,
//                "facet.date.end": setup.date_end,
//                "facet.date.gap": setup.date_gap
//             })
//            .then(function (result){
//                
//             });
//    };
    
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

        //searchParams
        angular.forEach($scope.searchParams, function(values, key) {
            switch(key) {
                case "query":
                   angular.forEach(values, function(val) {
                      query = setup.queryField + ":" + val; 
                      queries.push(query);
                   });
                   break;
                case "emailAddress":
                   break;
                default:
            }
            
         });
         
        $scope.searchResult = {};
        $scope.facetResult = {};
        $scope.graphPieResults = {};
        $scope.graphDateResults = {};

        var docs;
        var facets;
        var dateFacets;
        
        var chartConfigs;
        var slice;
         
        angular.forEach(queries, function(val) {
             docs = "";
             facets = "";
             dateFacets = "";
             
             chartConfig = "";

             Solstice.search({
                q: val,
                facet: true,
                "facet.field": setup.facetFields,
                "facet.mincount": 1,
                "facet.date": setup.dateFacets.date,
                "facet.date.start": setup.dateFacets.date_start,
                "facet.date.end": setup.dateFacets.date_end,
                "facet.date.gap": setup.dateFacets.date_gap
             })
            .then(function (result){
                
                console.log(result.data);
                docs = result.data.response.docs;
                facets = result.data.facet_counts.facet_fields;
                dateFacets = result.data.facet_counts.facet_dates;
                
                key = val.substr(val.indexOf(':')+1,val.length);
                if (docs.length > 0) {
                    $scope.searchResult[key] = docs;
                    $scope.facetResult[key] = facets;
                    $scope.graphPieResults[key] = drawPieGraphResults(key, facets);
                    $scope.graphDateResults[key] = drawDateGraphResults(key, dateFacets);
                } else {
                    $scope.searchResult[key] = null;
                    $scope.facetResult[key] = null;
                }
            });
        });
        
        
        
        // Creates facet graphs using HighCharts
        function drawPieGraphResults(searchTerm,facets) {
            chartConfigs = [];
            angular.forEach(facets, function(facetVal, facetName) {
                if (facetVal) {
                    
                    var chartConfig = {
                            chID: searchTerm + '-' + facetName,
                            //This is not a highcharts object. It just looks a little like one!
                            options: {
                                //This is the Main Highcharts chart config. Any Highchart options are valid here.
                                //will be ovverriden by values specified below.
                                chart: {
                                    type: 'pie'
                                },
                                tooltip: {
                                    style: {
                                        fontWeight: 'bold'
                                    }
                                },
                                plotOptions: {
                                    pie: {
                                        size: "100%",
                                        dataLabels: {
                                            enabled: false
                                        }
                                    }
                                }
                            },
                            loading: false,
                            size: {
                                width: setup.width,
                                height: setup.height
                            }
                    };

                    chartConfig.title = {};
                    chartConfig.series = [];

                    chartConfig.title.text = angular.uppercase(facetName);

                    var chData = [];
                    slice = {};
                    for (var i=0; i<facetVal.length; i++) {
                        if ( (i+2)%2 === 0) {
                            slice.name = facetVal[i];
                        } else {
                            slice.y = facetVal[i];
                            chData.push(slice);
                            slice = {};
                        }
                    }
                    chartConfig.series.push({id: searchTerm + "-" + facetName, name: "count", data: chData});
                    chartConfigs.push(chartConfig);
                }
            });
            return chartConfigs;
        }
        
        // Creates date facet graphs using HighCharts
        function drawDateGraphResults(searchTerm, dateFacets) {
            chartConfigs = [];
            angular.forEach(dateFacets, function(facetVal, facetName) {
                if (facetVal) {
                    
                    var chartConfig = {
                            chID: searchTerm + '-' + facetName,
                            //This is not a highcharts object. It just looks a little like one!
                            options: {
                                //This is the Main Highcharts chart config. Any Highchart options are valid here.
                                //will be ovverriden by values specified below.
                                chart: {
                                    type: 'column'
                                },
                                tooltip: {
                                    style: {
                                        fontWeight: 'bold'
                                    }
                                }
                            },
                            loading: false,
                            size: {
                                width: setup.width,
                                height: setup.height
                            }
                    };

                    chartConfig.title = {};
                    chartConfig.series = [];
                    chartConfig.title.text = angular.uppercase(facetName);

                    var chData = [];
                    slice = {};
                    for (var i=0; i<facetVal.length; i++) {
                        if ( (i+2)%2 === 0) {
                            if (facetVal[i] ===  'gap') {
                                break;
                            }
                            slice.name = facetVal[i];
                        } else {
                            slice.y = facetVal[i];
                            chData.push(slice);
                            slice = {};
                        }
                    }
                    chartConfig.series.push({id: searchTerm + "-" + facetName, name: "count", data: chData});
                    chartConfigs.push(chartConfig);
                }
            });
            return chartConfigs;
        }
    
    }; // End of searchAll bracket
    
    
});

