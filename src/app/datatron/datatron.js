angular.module( 'cybertron.datatron', [
  'ui.router',
  'placeholders',
  'ui.bootstrap',
  'cybertron.datatron.searchbox',
  'solstice',
  'highcharts-ng',
  'ncy-angular-breadcrumb'
])

// config for defining controller and template
.config(function config( $stateProvider, SolsticeProvider) {
  SolsticeProvider.setEndpoint('http://quickstart.cloudera:8983/solr/log_analytics_demo_shard1_replica1');  
    
  $stateProvider.state( 'datatron', {
    url: '/datatron',
    views: {
      "main": {
        controller: 'DatatronCtrl',
        templateUrl: 'datatron/datatron.tpl.html'
      }
    },
    data:{ pageTitle: 'DataTron' },
    ncyBreadcrumb: { label: 'DataTron', parent: 'home'}
  });
})

.value('setup', {
    queryField: 'record',
    facetFields: ['extension', 'app', 'subapp'],
    dateFacets: {   date:'time', 
                    date_start:'2014-05-04T00:00:00Z',
                    date_end:'2014-05-05T00:00:00Z',
                    date_gap:'+1HOUR',
                    width: '800',
                    height: '400'
                },
    width: '300',
    height: '300'
})

.controller( 'DatatronCtrl', function DatatronCtrl( $scope, $q, Solstice, setup) {
    
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
                    $scope.graphPieResults[key] = drawGraphResults(key, facets, "pie");
                    $scope.graphDateResults[key] = drawGraphResults(key, dateFacets, "column");
                } else {
                    $scope.searchResult[key] = null;
                    $scope.facetResult[key] = null;
                }
            });
        });
        
        
        
        // Creates facet graphs using HighCharts
        function drawGraphResults(searchTerm,facets,chartType) {
            chartConfigs = [];
            angular.forEach(facets, function(facetVal, facetName) {
                if (facetVal) {
                    
                    var chartConfig = {
                            chID: searchTerm + '-' + facetName,
                            title: {
                                text: angular.uppercase(facetName)
                            },
                            //This is not a highcharts object. It just looks a little like one!
                            options: {
                                //This is the Main Highcharts chart config. Any Highchart options are valid here.
                                //will be ovverriden by values specified below.
                                chart: {
                                    type: chartType
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
                                width: (chartType === 'pie') ? setup.width : setup.dateFacets.width,
                                height: (chartType === 'pie') ? setup.height : setup.dateFacets.height
                            }
                    };
                    
                    var chData = [];
                    slice = {};
                    chartConfig.series = [];

                    switch(chartType) {
                        case "pie":
                            for (var i=0; i<facetVal.length; i++) {
                                if ( (i+2)%2 === 0) {
                                    slice.name = facetVal[i];
                                } else {
                                    slice.y = facetVal[i];
                                    chData.push(slice);
                                    slice = {};
                                }
                            }
                            break;
                        case "column":
                            chartConfig.xAxis = {};
                            chartConfig.xAxis.type = 'category';
                            chartConfig.xAxis.labels = {rotation: 90};

                            angular.forEach(facetVal, function(dateVal,dateKey) {
                                if (['gap','start','end'].indexOf(dateKey) < 0) {
                                    splice = {};
                                    splice.name = dateKey;
                                    splice.y = dateVal;
                                    chData.push(splice);
                                }
                            });
                            break;
                        default:
                    }
                    chartConfig.series.push({id: searchTerm + "-" + facetName, name: facetName, data: chData});
                    chartConfigs.push(chartConfig);

                }
            });
            return chartConfigs;
        }
    
    }; // End of searchAll bracket
    
    
});

