/*


*/
USG.visualization = {};
(function(){
	// environment
	this.environment = ( function(){
		
		/* Private Methods */
		
		// Class EnvironmentInstance
		// Holds a dataset and associated visualizations for that dataset.
		var EnvironmentInstance = function( callback ){
			
			this.datasets = []; // Array of dataset objects stored here ( loadData(); )
			this.metricSet = metric.createSet(  ); // Set of all metrics used in this environment 
			this.visualizations = []; // Array of visualization objects for this environment ( heatmap, etc. )

			gui.initialize( callback ); // Set up gui (Asychronous) then execute callback

		};
		EnvironmentInstance.prototype = {
			
			// Adds a HeatmapSet visualization to the environment
			addHeatmapSet: function ( dataLocation, config ){
				// If the dataset exists, visualize
				if( this.datasets[ dataLocation ] ){

					// Create visualization key
					var visualizationKey = "heatmap-" + dataLocation;

					// Create heatmap in visualizations[] with the 
					// dataKey , visualizationKey , dataset , config , metricSet
					this.visualizations[visualizationKey] = heatmap.create( dataLocation, visualizationKey, this.datasets[ dataLocation ], config , this.metricSet );


				} else {

					console.log("No data found. Try loading " + dataLocation + " using environment.loadData( \"fileLocation\" )")
				}
				
			},

			// Loads a .csv file into the visualization. Creates metric objects used in the visualization
			// @param: 
			// 		dataLocation - String. Url of releative location of csv file
			// 		callback - function(). Optional. 
			loadData: function( dataLocation, callback ){
				
				var thisObj = this;
				var thisNamespace = USG.visualization.environment; 
				var dataset = thisObj.dataset;

				d3.csv( dataLocation , function parseRows ( d ) {

					// For each property in a row ( d ) 
		        	for ( var prop in d ) {

		            		thisObj.metricSet.addMetric( prop );

		            		// if datatype is not a string
		            		if( !thisObj.metricSet.isString( prop ) ) {
		            			d[prop] = +d[ prop ];
		            		}

		            }

		            return d;

		        }, function done ( error, data ) {
					
		        	var rReplace = /\.csv/g;
					dataLocation = dataLocation.replace(rReplace, "");

					if ( data ) {
						console.log( "Metrics created:");
						console.log( thisObj.metricSet );
						dataset = data;
						console.log( "Data Loaded:");
						console.log( data );
					}
					
					if ( error ){
						console.log( error.stack );
					}

					// Add dataset
					thisObj.datasets[ dataLocation ] = data;

					// Initialize metric domains
					thisObj.metricSet.setDomains( thisObj.datasets[ dataLocation ], dataLocation );
					thisObj.metricSet.orderMetrics();
					callback();

				});
	
			}
		};

		/* Public Methods */

		// Create and return environmentInstance
		var create = function( callback ){
			return new EnvironmentInstance( callback );
		};

		// environment.heatmap
		var heatmap = ( function(){
			var thisObj = this;

			/* Private Methods */
			// Class HeatmapSet
			// Holds a dataset and associated visualizations for that dataset
			var HeatmapSet = function ( dataKey , visualizationKey , dataset , config , metricSet ){
				// Properties
				//
				this.key = visualizationKey; // Key for specific heatmap
				this.dataKey = dataKey; // Key for data heatmap is representing

				this.tiers = [];
				this.metricSet = metricSet;

				this.dataset = dataset;

				this.colorscheme = USG.constants.colors.colorbrewer.Greys[9];

				var thisObj = this;

				var addHTML = function( tiers ) {
					var tierHTML = "";
					for(var i = 0; i < tiers.length; i++){
						tierHTML += '' + tiers[i].getHTML();
					}
					var html = ('<div class="col-sm-12 full-height"><div class="container-fluid full-height"><div class ="row heatmap" id=' + thisObj.key + '>' + tierHTML + '</div></div></div>');
						
					// Append a container for the heatmap
					$( "#vizualizations-holder" ).append( html );
				};

				var visualizeTiers = function() {
					if ( thisObj.tiers ) {
						
						for (var i = 0; i < thisObj.tiers.length; i++) {
							thisObj.tiers[i].visualize();
						};

					}
				};

				var createTiers = function ( whichTiers ) {
					for (var i = 0; i < whichTiers.length; i++) {
						// Will append html to the heatmap container
						thisObj.tiers[i] = tier.create( thisObj.dataKey, thisObj.key, ( whichTiers[i] ) , dataset , thisObj.key , thisObj.metricSet );
					}
				};
				
				var init = function ( config ) {
					// default config
					if( config == "default" ){

						thisObj.setMetricColorScheme();	

						console.log("Create heatmap with default config");

						// Create new tier1, tier2, tier3
						var defTiersCreated = $.Deferred();
						createTiers([2, 1, 3]);
						defTiersCreated.resolve(thisObj.tiers);

						// Load html for tiers
						defTiersCreated.done(function(tiers){

							$.when( tiers[0].loadHTML() , tiers[1].loadHTML() , tiers[2].loadHTML() ).done(function () {
								addHTML( tiers );
								visualizeTiers( thisObj.categories );
							}); 

						});
						
					}
				}

				init( config );

				
			};
			HeatmapSet.prototype = {
				// Set the color scheme for the metrics using this heatmap's key
				setMetricColorScheme: function ( ) {
				
					this.metricSet.setColorScheme( this.dataKey , this.key , this.colorscheme );

				}
			};

			/* Public Methods */
			// Create and return HeatmapSet
			var create = function( dataKey , visualizationKey , dataset, config , metricSet ){
				// Create HeatmapSet and return it
				return new HeatmapSet( dataKey , visualizationKey , dataset , config , metricSet );
			};

			// environment.heatmap.gui
			var gui = ( function(){

				// Url to the heatmap html template file to be loaded.
				var EXTERNAL_HTML = {
				
					heatmapHolder: "html/heatmap.html"
				
				}

				return {

					EXTERNAL_HTML: EXTERNAL_HTML
				
				};

			})();

			// environment.heatmap.tiers
			var tier = ( function(){

				/* Private Methods */

				// Generic tier
				// Generic version of heatmap grid.
				var TierInstance = function( type , dataKey , key , dataset , htmlElem , metricSet ){
					this.key = key;
					this.dataKey = dataKey;
					this.dataset = dataset;
					this.metricSet = metricSet;
					this.gridmetricSet = metricSet.getOrderedMetrics();

					this.orderedMetrics = metricSet.getOrderedCategories();

					this.html = {
						parentContainer: htmlElem,
						id: "",
						url: "html/tier" + type + ".html"
					};


					this.type = type;
					this.visualizationType = "grid";


				};
				TierInstance.prototype = {
					// Loads html into this.html. Returns deferred promise object.
					loadHTML: function () {
						var deferred = $.Deferred(); // Create deferred object
						var thisObj = this; 

						// Load HTML
						var request = $.ajax({
							url: this.html.url,
							dataType: 'html'
						});

						// Process loaded HTML
						$.when(request).done(function( data ){

							var rId = "id=\"heatmap-tier" + thisObj.type + "\""
							var rId = new RegExp( rId , "g" );

							// Add specialized id for this tier
							var rReplace = "id=\"tier" + thisObj.type + "-" + ( thisObj.html.parentContainer ) + "\""; 
							data = data.replace( rId , rReplace );
							
							thisObj.html.markup = data;
							thisObj.html.id = "tier" + thisObj.type + "-" + thisObj.html.parentContainer;
							deferred.resolve(); 

						});
							
						return deferred.promise();
					},
					// Add svg and nodes 
					visualize: function () { 

						console.log( " Implement this method. " );

					},
					getHTML: function (  ) {
						return this.html.markup;
					}, 
					// Loops through all non-string metrics and executes the passed draw function 
					draw: function ( drawFunction ) {
						var currentMetricIndex = 0;
						var thisObj = this;

						for(var categoryIndex = 0; categoryIndex < thisObj.orderedMetrics.length ; categoryIndex++ ){
							
							var categoryName = thisObj.orderedMetrics[categoryIndex].name;

							if(!thisObj.metricSet.categories[categoryName].allString){

								for(var metricIndex = 0; metricIndex < thisObj.orderedMetrics[categoryIndex].metrics.length; metricIndex++ ){
									
									var metricName = thisObj.orderedMetrics[categoryIndex].metrics[metricIndex];
									
									if( !thisObj.metricSet.isString( metricName ) ){

										drawFunction( thisObj, categoryIndex , metricIndex , metricName, currentMetricIndex );

										currentMetricIndex++;

									}

								}
							}
							
							
							
						}
					},
					// Template for what a draw function could look like
					drawFunction: function ( thisObj, categoryIndex , metricIndex , metricName , currentMetricIndex ) {

						console.log("Implement this method");

					}
				};

				var Svg = function ( height, width, id, parentContainer ) {
					this.html = {
						container: {
							id: parentContainer
						},
						id: id
					};
					this.obj = {};
					this.viewBox = {};
					this.dimensions = {
						height: height,
						width: width
					};

					var init = function (thisObj) {
						var svgSelector = "#" + thisObj.html.container.id + " " + thisObj.html.id;
						svgSelector = $(svgSelector).toArray();

						// Determine size of SVG viewBox using parent container dimensions
						thisObj.viewBox = "0 0 " + $( thisObj.html.id ).width() + " " + (thisObj.dimensions.height);

						// SVG
						thisObj.obj = d3.selectAll(svgSelector).append("svg")
							.attr("viewBox", thisObj.viewBox)
							// .attr("overflow", "visible")
							.attr("height", thisObj.dimensions.height)
					 			.attr("width", thisObj.dimensions.width)
								.attr("preserveAspectRatio", "xMidYMin meet");

						// Determine mid point of height and width 
						thisObj.dimensions.heightMidpoint = thisObj.dimensions.height / 2;
						thisObj.dimensions.widthMidpoint = thisObj.dimensions.width / 2;

					};

					init(this);

				};
				Svg.prototype = {

				};


				// Specialized tiers
				//// Small view, sidebar
				var Tier1 = function ( type , dataKey , key , dataset , htmlElem , metricSet  ) {

					TierInstance.call( this , type , dataKey , key , dataset , htmlElem , metricSet );
					
					this.margin = {
						top: 0,
						column: 10
					};

					this.grid = {
						size: {
							width: 3,
							height: 3
						}
					};
						
					this.html.id = "#" + htmlElem;

					console.log(this.html.id);

				};
				Tier1.prototype = Object.create( TierInstance.prototype, {
					visualize: {
						value: function ( ) {

							this.createsvg();
							this.drawGrid();
							
						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					createsvg: {
						value: function () {
							var id = "#" + this.html.id,
							height = $( "#vizualizations-holder" ).height(),
							width = $( id ).width();

							this.svg = new Svg(height, width, id, this.html.parentContainer);

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					drawGrid: { 
						value: function () {

							var thisObj = this;

							thisObj.draw( thisObj.initializeBlocks );
							thisObj.draw( thisObj.drawBlocks );

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					initializeBlocks: {
						value: function ( thisObj, categoryIndex , metricIndex , metricName, currentMetricIndex ) {

							var category = thisObj.orderedMetrics[categoryIndex].name;
							var svg = thisObj.svg.obj;

							var nameClass = "." + metricName;	

							// Initialize this block
							var columnObj = svg.selectAll(nameClass);

							columnObj
								.data(thisObj.dataset)
								.enter()
								.append("rect")
								.attr("class", function(d, i){return "password"+i+" "+metricName+" "+d['originalPassword']+" "+ d['permutedPassword']+" "+metricName+"block";})
								.attr("id", function(d){return d['originalPassword'] + metricName;})

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					drawBlocks: {
						value: function ( thisObj, categoryIndex , metricIndex , metricName, currentMetricIndex ) {

							var svg = thisObj.svg.obj;

							var nameClass = "." + metricName;

							var colorScale = thisObj.metricSet.metrics[ metricName ].colorScale[thisObj.dataKey][thisObj.key];

							// Initialize this block
							// Draw large grid
							var columnObj = svg.selectAll( nameClass );
						
							columnObj
								.attr("transform", function(d, i) {

									return "translate(" + ((( (currentMetricIndex) - ((thisObj.gridmetricSet.length + thisObj.orderedMetrics.length-1)/2)) * (thisObj.grid.size.width - .2)) + thisObj.svg.dimensions.widthMidpoint) + ", " + ((thisObj.grid.size.height * i) + thisObj.margin.top) + ")";
							
								})
								.attr("width", thisObj.grid.size.width)
          						.attr("height", thisObj.grid.size.height)
          						.style("fill", function(d) { return colorScale(d[metricName]); });

							
							
						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					}
				}); 
				Tier1.prototype.constructor = Tier1;


				// Medium view, scrollable
				var Tier2 = function ( type , dataKey , key , dataset , htmlElem , metricSet  ) {
					TierInstance.call(this, type , dataKey , key , dataset , htmlElem , metricSet );

					
					this.grid = {
						size: {
							width: 17,
							height: 17
						},
						margin: {
							top: 0,
							column: 10 
						}
					}

					this.labels = {
						password: {
							margin: {
								left: 15
							}
							
						}, 
						column: {
							margin: {
								bottom: 10
							},
							size: {
								line: 5
							}
						}
					}


				};
				Tier2.prototype = Object.create( TierInstance.prototype, {
					visualize: {
						value: function ( ) {
							this.createsvg();

							this.drawLabels();
							this.drawGrid();
						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					}, 
					createsvg: {
						value: function () {
							var id = "#heatmap-tier2-columns-svg-container";
							
							var height = 250;
							var width = $( id ).width();
							this.columnsSvg = new Svg( height, width, id, this.html.parentContainer );
							
							id = "#heatmap-tier2-grid-svg-container";
							height = $( "#vizualizations-holder" ).height() - this.columnsSvg.dimensions.height
							width = $( id ).width();

							this.svg = new Svg( height, width, id, this.html.parentContainer );

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					drawLabels:{
						value: function ( ) {
							var thisObj = this;

							this.drawPasswordLabels();
							this.draw( thisObj.drawColumnLabels );

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					drawPasswordLabels: {
						value: function ( ) {
							var thisObj = this;
							
							var gridsvg = thisObj.svg.obj;
							var columnssvg = thisObj.columnsSvg.obj ;


							// Create password labels for main diagram
							var passwordLabels = gridsvg.selectAll(".passwordLabels")
								.data(thisObj.dataset)
								.enter().append("text")
								.text(function (d) { return d['originalPassword']; })
								.style("text-anchor", "end")
								.attr("transform", function (d, i) { return "translate(" + (( -1 * thisObj.grid.size.width * ( (thisObj.gridmetricSet.length +  thisObj.orderedMetrics.length - 1)/2)) - thisObj.labels.password.margin.left + thisObj.svg.dimensions.widthMidpoint) + "," +  ((i * thisObj.grid.size.height) + thisObj.grid.margin.top + (thisObj.grid.size.height * .8)) + ")";
								})
								.attr("class", function (d, i) { return "password mono hiderow" })
								.attr("id", function (d, i) { return "labelpassword"+i; });

							// Create password labels for main diagram
							var passwordLabelsPermuted = gridsvg.selectAll(".passwordLabelsPermuted")
								.data(thisObj.dataset)
								.enter().append("text")
								.text(function (d) { return d['permutedPassword']; })
								.style("text-anchor", "start")
								.attr("transform", function (d, i) { return "translate(" + (( thisObj.grid.size.width * ( (thisObj.gridmetricSet.length +  thisObj.orderedMetrics.length - 1)/2)) + thisObj.labels.password.margin.left + thisObj.svg.dimensions.widthMidpoint) + "," +  ((i * thisObj.grid.size.height) + thisObj.grid.margin.top + (thisObj.grid.size.height * .8)) + ")";
								})
								.attr("class", function (d, i) { return "password mono hiderow" })
								.attr("id", function (d, i) { return "labelpassword"+i; });	


							// Create labels for columns
							var labels = columnssvg.selectAll(".metricLabel")
								.data(thisObj.orderedMetrics)
								.enter().append("g")
								.attr("class", function(d, i){
									return (d.name + i + "");
								});

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					drawColumnLabels: {
						value: function ( thisObj, categoryIndex , metricIndex , metricName , currentMetricIndex ) {
							
							var columnssvg = thisObj.columnsSvg.obj ;
						
							var id = "." + thisObj.orderedMetrics[categoryIndex].name + categoryIndex + "";
							var labels = columnssvg.selectAll(id);

							labels.append("text")
							.text(function(d, i){

								return thisObj.metricSet.metrics[metricName].label;
							})
							.style("text-anchor", "start")
							.attr("transform", function() {
								
								return "translate(" + ((( (currentMetricIndex + categoryIndex) - ((thisObj.gridmetricSet.length + (thisObj.orderedMetrics.length - 1))/2)) * thisObj.grid.size.width) + ((thisObj.grid.size.width)/2) + thisObj.columnsSvg.dimensions.widthMidpoint) + ", " + (thisObj.columnsSvg.dimensions.height - thisObj.labels.column.size.line - 5) + "), rotate(-70)";
							
							})
							.attr("class", function(){return "label"+metricName+" columnLabel mono axis step "+metricName});


							labels.append("line")
								.attr("x1", 0)
								.attr("x2", thisObj.labels.column.size.line)
								.attr("y1", 0)
								.attr("y2", 0)
								.attr("style", "stroke: #000")
								.attr("stroke-opacity", 0.2)
								.attr("transform", function(d, i) {
									
									return "translate(" + ((( (currentMetricIndex + categoryIndex) - ((thisObj.gridmetricSet.length + (thisObj.orderedMetrics.length-1))/2)) * thisObj.grid.size.width) + (thisObj.grid.size.width/2) + thisObj.columnsSvg.dimensions.widthMidpoint) + ", " + thisObj.columnsSvg.dimensions.height + "), rotate(-90)";
								
								});
						
						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					drawGrid:{
						value: function ( ) {
							var thisObj = this;

							this.draw( thisObj.initializeBlocks );
							this.draw( thisObj.drawBlocks );

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					initializeBlocks: {
						value: function ( thisObj, categoryIndex , metricIndex , metricName , currentMetricIndex ) {
							
							var gridsvg = thisObj.svg.obj;

							var nameClass = "." + metricName;	

							// Initialize this block
							// Draw large grid
							var columnObj = gridsvg.selectAll(nameClass);

							columnObj
								.data(thisObj.dataset)
								.enter()
								.append("rect")
								.attr("class", function(d, i){return "password"+i+" "+metricName+" "+d['originalPassword']+" "+ d['permutedPassword']+" "+metricName+"block hiderow";})
								.attr("id", function(d){return d['originalPassword'] + metricName;})
								.style("fill", "#000");

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					drawBlocks: {
						value: function ( thisObj, categoryIndex , metricIndex , metricName , currentMetricIndex ) {

							var gridsvg = thisObj.svg.obj;
							var columnssvg = thisObj.columnsSvg.obj ;

							var nameClass = "." + metricName;	
							
							var colorScale = thisObj.metricSet.metrics[metricName].colorScale[thisObj.dataKey][thisObj.key];

							// Initialize this block
							// Draw large grid
							var columnObj = gridsvg.selectAll(nameClass);

							columnObj
								.attr("transform", function(d, i) {

									return "translate(" + ((( (currentMetricIndex + (categoryIndex)) - ((thisObj.gridmetricSet.length + thisObj.orderedMetrics.length-1)/2)) * (thisObj.grid.size.width - .2)) + thisObj.columnsSvg.dimensions.widthMidpoint) + ", " + ((thisObj.grid.size.height * i) + thisObj.grid.margin.top) + ")";
							
								})
								.attr("width", thisObj.grid.size.width)
          						.attr("height", thisObj.grid.size.height)
          						.style("fill", function(d) { return colorScale(d[metricName]); });
				
						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					}
				}); 
				Tier2.prototype.constructor = Tier2;


				//// Close up view  
				var Tier3 = function ( type , dataKey , key , dataset , htmlElem , metricSet  ) {
					TierInstance.call(this, type , dataKey , key , dataset , htmlElem , metricSet );

					// Size and margin information for grid
					this.grid = {
						dimensions: {
							width: 15,
							height: 15
						},
						margin: {
							top: 80,
							right: 0,
							left: 0
						}
					};

					// Id of the SVG HTML element
					// this.svg.html.id = "#heatmap-tier3-svg-container";
					
				};
				Tier3.prototype = Object.create( TierInstance.prototype, {
					visualize: {
						value: function ( ) {
							this.createsvg();
							this.draw();
							this.initializeControls();

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					createsvg: {
						value: function () {
							var thisObj = this;
							var id = "#heatmap-tier3-svg-container",
							width = $( id ).width(),
							height = (thisObj.grid.dimensions.height * thisObj.gridmetricSet.length) + 50 ;

							this.svg = new Svg( height, width, id, this.html.parentContainer )

							this.grid.margin.left = this.svg.dimensions.width - (this.grid.dimensions.width * 10) + 10;

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					}, 
					initializeControls: {
						value: function () {
							thisObj = this;

							// About this dataset

							// File displayed 
							$('.about-dataset-holder').append('<tr><th>File displayed:<td id="fileDisplayed"></td></tr>');
							$('#fileDisplayed').html(thisObj.dataKey);

							// Number of passwords
							$('.about-dataset-holder').append('<tr><th>Number of passwords:<td id="numPasswords"></td></tr>');
							$('#numPasswords').html(thisObj.dataset.length);

							// Filter, Rank, Show/hide columns 
							for(var prop in thisObj.metricSet.categories){
								
								// If there is at least one metric in this category with a non-string data type
								if( thisObj.metricSet.categories[prop].metricOrder.length != 0 && !thisObj.metricSet.categories[prop].allString){ 

									// Filter: Append category title
									$('.filter-holder').append('<h4>' + prop + '</h4>');

									// Rank by: Append category title 
									$('.rank-holder').append('<br><h4 class="rank-category-label" >' + prop + '</h4>');

									// Show/hide columns 
									$('.hide-columns-holder').append('<br><h4 class="hide-columns-label" >' + prop + '</h4>');


									// Add each metric in category
									for( var i = 0; i < thisObj.metricSet.categories[prop].metricOrder.length; i++  ){

										var metricName = thisObj.metricSet.categories[prop].metricOrder[i],
										metricObj = thisObj.metricSet.metrics[metricName],
										metricLabel = metricObj.label,
										sliderlabelid =  metricName + '-sliderRange'
										sliderid = metricName + '-slider';

										// If the metric has a domain, add to GUI
										if(metricObj.domainVal) {
											// Filter 
											var html = '<div class="row">';
											
											html += '<div class="col-sm-12"><h5>' +  metricLabel + ':  <span id="' + sliderlabelid + '" ></h5></div>';
											
											html += '<div class="col-sm-12"><div id="' + sliderid + '" style="" class="slider"></div></div>';

											html += '</div>';

											$('.filter-holder').append(html);
											html = '';

											// Retrieve min and max of metric domain
											var min = Math.round(metricObj.domainVal[thisObj.dataKey].min * 100)/100,
												max = Math.round(metricObj.domainVal[thisObj.dataKey].max * 100)/100,
												id = "#"+sliderlabelid;

											$(id).append( min + " - " + max);

											id = '#' + sliderid;

											 // Filter: Activate sliders
											$(id).empty().slider({
												orientation: "horizontal",
												range: true,
												min: min,
												max: max,
												values: [min,max],
												slide: function( event, ui ) {
													var type = $(event.target).attr("id");
													
													// filterPasswords( type, ui.values );
													var labelID = "#" + type + "Range";
													$(labelID).html(ui.values[0] + " - " + ui.values[1]);
												}
											});


											// Rank by 
											$('.rank-holder').append('<label class="sortBtn btn btn-xs btn-default btn-block"><input type="radio" name="options" id="' + metricName + '">' + metricLabel + '</label>');

											// Show only columns visible in the grid ( gridmetricSet )
											if( thisObj.gridmetricSet.indexOf(metricName) > -1 ){
												// Show/hide Columns
												$( '.hide-columns-holder' ).append( '<label class="btn btn-xs btn-block btn-default active display-btn" id="' + metricName + 'hide-column" style="margin:2px;"><input type="checkbox">' + metricLabel + '</label>' );
											}
											

										}


										
									}
									
									// Filter: add space after category
									$('.filter-holder').append('<div class="row"><hr></div>');
									$('.rank-holder').append('<br><hr>');


									// Hide columns: add "Hide All" button
									$('.hide-columns-holder').append('<br><label class="btn btn-xs btn-block btn-default active display-btn" id="' + prop + 'hide-column" style="margin:2px;"><input type="checkbox"> Hide All </label>');
							}
							
						}

						html += '</div>';

						$('.filter-holder').append(html);

						for(var prop in thisObj.metricSet.categories){
							if( thisObj.metricSet.categories[prop].metricOrder.length != 0 && !thisObj.metricSet.categories[prop].allString){

								for( var i = 0; i < thisObj.metricSet.categories[prop].metricOrder.length; i++  ){
									var metricName = thisObj.metricSet.categories[prop].metricOrder[i],
									metricObj = thisObj.metricSet.metrics[metricName];
									
								}
							}
						}
									

							// Add html

							// Rank by

							// Show/hide columns

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					draw: {
						value: function () {
							this.drawLabels();
							this.drawBlocks();

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					drawLabels: {
						value: function () {
							var thisObj = this;
							var svg = thisObj.svg.obj;

							var x = thisObj.grid.margin.left;
							var top = thisObj.grid.margin.top;

							// Create labels for columns
							var breakdownLabel = svg.selectAll(".breakdownLabel")
								.data(thisObj.orderedMetrics)
								.enter().append("g").attr("class", function(d, i){
									return d.name + i + " breakdownLabel";
								});

							var totalMetrics = 0; // Keeps track of total metrics used

							for(var j = 0; j < thisObj.orderedMetrics.length; j++){
								
								breakdownLabel.append("text").text(function(d,i){
									return 
								})
								.attr("transform", function(){
									return "translate(" + (x) + ", " + ((thisObj.grid.dimensions.height * totalMetrics) + top + (thisObj.grid.dimensions.height * .75)) + ")";
								});

								var className = "." + thisObj.orderedMetrics[j].name + j;
								var label = svg.selectAll(className);
								
								for(var k = 0; k < thisObj.orderedMetrics[j].metrics.length; k++){	
									var name = thisObj.orderedMetrics[j].metrics[k];
									
									if(thisObj.metricSet.metrics[name].permuted.type != "permuted"){
		
										label.append("text")
										.text(function() { 
		
											return thisObj.metricSet.metrics[name].label;
									 
										})
										.style("text-anchor", "end")
										.attr("transform", function() {
											
											return "translate(" + (x - 10) + ", " + ((thisObj.grid.dimensions.height * totalMetrics)+ top + (thisObj.grid.dimensions.height * .75)) + "), rotate(0)";
										
										})
										.attr("class", function(d, i){return "breakdownlabel-"+name+" mono "+name});

										label.append("text")
										.text(function() { 
		
											return " 0 ";
									 
										})
										.style("text-anchor", "middle")
										.attr("transform", function() {
											
											return "translate(" + ((x - 1) + (thisObj.grid.dimensions.width/2)) + ", " + ((thisObj.grid.dimensions.height * totalMetrics)+ top + (thisObj.grid.dimensions.height * .75)) + "), rotate(0)";
										
										})
										.attr("class", function(){return "breakdown-holder-original-"+name+" mono "+name});
									}	
		
									totalMetrics++;

								}

								totalMetrics++;

							}
							

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					},
					drawBlocks: {
						value: function () {
							var thisObj = this;
							var svg = thisObj.svg.obj;

							var x = thisObj.grid.margin.left;
							var top = thisObj.grid.margin.top;


							// Create labels for columns
							var breakdownBlocks = svg.selectAll(".breakdownBlock")
								.data(thisObj.orderedMetrics)
								.enter().append("g").attr("class", function(d, i){
									return d.name + i + "-block";
								});

							var totalMetrics = 0; // Keeps track of total metrics used
							var totalMetricsPermuted = 0;

							var numPairs = 0;
							var originalFlag = false;
							
							for(var j = 0; j < thisObj.orderedMetrics.length; j++){
								
								breakdownBlocks

								var className = "." + thisObj.orderedMetrics[j].name + j + "-block";
								var block = svg.selectAll(className);
								var permutedFlag = false;
								

								for(var k = 0; k < thisObj.orderedMetrics[j].metrics.length; k++){	
									var name = thisObj.orderedMetrics[j].metrics[k];
									
									if(thisObj.metricSet.metrics[name].permuted.type != "permuted"){
										
										block.append("rect").text(function(d,i){
											return
										})
										.attr( "width", thisObj.grid.dimensions.width )
										.attr( "height", thisObj.grid.dimensions.height )
										.attr("transform", function(){
											return "translate(" + (x + thisObj.grid.dimensions.width) + ", " + ((thisObj.grid.dimensions.height * totalMetrics) + top) + ")";
										})
										.attr("class", function(){return "breakdownblock"+name+" "+name});
										
										totalMetrics++;

										permutedFlag = false;

										if(thisObj.metricSet.metrics[name].permuted.type == "original"){
											numPairs++;
											originalFlag = true;
											
										}
								
									} else {

										block.append("rect").text(function(d,i){
											return
										})
										.attr( "width", thisObj.grid.dimensions.width )
										.attr( "height", thisObj.grid.dimensions.height )
										.attr("transform", function(){
											return "translate(" + (x + (thisObj.grid.dimensions.width * 2)) + ", " + ((thisObj.grid.dimensions.height * (numPairs - totalMetricsPermuted + 1)) + top) + ")";
										})
										.attr("class", function(){return "breakdownblock"+name+" "+name});

										totalMetricsPermuted++;

										permutedFlag = true;
										var permutedMetricFlag = true;
									}
		
		
								}	

									totalMetrics++;

									if(permutedFlag){
										totalMetricsPermuted++;
									}
		
							}

							if(originalFlag && permutedMetricFlag){

								svg.append("text")
									.text("Original")
									.attr("transform", function(){
										return "translate(" + (x + (thisObj.grid.dimensions.width * 1.8)) + ", " + (thisObj.grid.margin.top - 5) + ")rotate(-70)";
									})
									.attr("class", function(){
										return "mono";
									});
								svg.append("text")
									.text("Permuted")
									.attr("transform", function(){
										return "translate(" + (x + (thisObj.grid.dimensions.width * 2.8)) + ", " + (thisObj.grid.margin.top - 5) + ")rotate(-70)";
									})
									.attr("class", function(){
										return "mono";
									});


								svg.selectAll(".breakdownLabel").append("text")
									.text(function() { 
	
										return " 0 ";
								 
									})
									.style("text-anchor", "middle")
									.attr("transform", function(d , i) {
										
										return "translate(" + ((x - 1) + (thisObj.grid.dimensions.width/2) + (thisObj.grid.dimensions.width*3)) + ", " + ((thisObj.grid.dimensions.height * i)+ top + (thisObj.grid.dimensions.height * .75)) + "), rotate(0)";
									
									})
									.attr("class", function(){return "breakdown-holder-permuted-"+name+" mono "+name});
							
							}
								

						},
						enumerable: true,
					    configurable: true, 
					    writable: true
					}
				} ); 
				Tier3.prototype.constructor = Tier3;

				var types = {
					1: Tier1,	 
					2: Tier2, 
					3: Tier3
				};


				/* Public Methods */
				var create = function( dataKey, key, type , dataset, htmlElem, metricSet ){
					if( types[type] ){

						var tier = types[type];
						return new tier( type , dataKey , key , dataset , htmlElem , metricSet );
					
					}
					
				};
			
				return {
					create: create
				};
			 
			})();


			return {
				create: create
			};

		})();

		// environment.metric
		var metric = ( function(){
			
			/* Private Methods */

			// Holds metric type data
			// Defined in USG-constants file
			// USG.constants.metric
			var METRIC_PROP = USG.constants.metric;
			
			// Class MetricSet
			// Holds a metric and associated specifications for that metric.
			var MetricSet = function(  ){
				this.metrics = {};
				this.metricList = [];
				this.categories = [];

				var init = function (thisObj) {
					thisObj.categories[ "uncategorized" ] = new Category ( "uncategorized" );
				};

				init(this);
			};
			MetricSet.prototype = {
				addMetric: function ( type ) {
					thisObj = this;

					// Check if metric exists 
					if ( !this.metrics[ type ] ) {
						
						// Create metric
						var thisMetric = this.metrics[ type ] = new MetricInstance( type );
						thisObj.metricList.push( thisMetric );

						// If has category type, add to that category
						if ( thisMetric.category.name ) {
							
							// Create a category, if doesn't exist
							if( !thisObj.categories[ thisMetric.category.name ] ){
								console.log("category created:")
								console.log(thisMetric.category.name);
								thisObj.categories[ thisMetric.category.name ] = new Category( thisMetric.category.name , thisMetric.permuted );
							}

							// Add metric to that category
							thisObj.categories[ thisMetric.category.name ].add( thisMetric );

						// Add to "uncategorized" 
						} else {

							thisObj.categories[ "uncategorized" ].add( thisMetric );

						}

					}
				},

				// Set domain for all metrics
				setDomains: function ( dataset , dataLocation ) {
					thisObj = this;

					for( var prop in thisObj.metrics ){

						// Set domain for specific dataset
						thisObj.metrics[ prop ].setDomain( dataset , dataLocation );

					}

				},
				hasMetric: function ( type ) {
					
					if(this.metrics[ type ]){
					
						return true;
					
					}

					return false;
					
				},

				// Return ordered array of metrics organized by largest to smallest category
				// Non permuted metric will be at the center of the array
				// Items with a metric counterpart 
				// 	@param: String[] containing category names 
				orderMetrics: function ( ) {
					
					var categoryArray = []; // Used for sorting categories by size
					var categoriesToBeAdded = []; // Holds categories that don't have permuted pairs
					this.orderedMetrics = []; // Ordered metric array
					
					// Add categories to an array to be sorted
					for(var prop in this.categories){
						categoryArray.push( [ prop , this.categories[ prop ] ] );
					}

					// Sort categories from smallest to largest
					categoryArray.sort(function(a, b){

						var a = a[1];
						var b = b[1];
						return a.metricOrder.length - b.metricOrder.length;

					});

					// Start with the largest category and add to the array
					// Add metrics with permuted pairs first
					// Original metrics
					for( var i = categoryArray.length - 1; i > 0 ; i-- ) {
						// Add original 
						if( categoryArray[i][1].isPermuted ){

							var obj = categoryArray[i][1];

							for(var j = 0; j < obj.metricsOriginal.length; j++){

								this.orderedMetrics.push( obj.metricsOriginal[ j ] );

							}


						} else {

							categoriesToBeAdded.push( categoryArray[i] );

						}
				
					}

					// Add metrics without permuted pairs
					for( var i = 0; i < categoriesToBeAdded.length; i++ ) {
						if(!categoriesToBeAdded[i][1].allString){
							// Add metrics
							var obj = categoriesToBeAdded[i][1];

							for(var j = 0; j < obj.metricOrder.length; j++){
								if(obj.metrics[ obj.metricOrder[ j ] ].dataType != "String"){
									
									this.orderedMetrics.push( obj.metricOrder[ j ] );

								}
							} 
						}
							

						
					}

					// Add metrics with permuted pairs again
					// Permuted metrics
					for( var i = 0; i < categoryArray.length ; i++ ) {
						
						// Add permuted 
						if( categoryArray[i][1].isPermuted ){
							var obj = categoryArray[i][1];

							for(var j = obj.metricsPermuted.length-1; j > -1 ; j--){

								this.orderedMetrics.push( obj.metricsPermuted[ j ] );

							}
						}

						
					}

					return this.orderedMetrics;
					
				
				},
				getOrderedMetrics: function ( ) {
					if( !this.orderedMetrics ) {
						return this.orderMetrics();
					} else {
						return this.orderedMetrics;
					}
				},
				orderCategories: function ( ) {
					
					var categoryArray = []; // Used for sorting categories by size
					var categoriesToBeAdded = []; // Holds categories that don't have permuted pairs
					this.orderedCategories = []; // Ordered metric array
					
					// Add categories to an array to be sorted
					for(var prop in this.categories){
						categoryArray.push( [ prop , this.categories[ prop ] ] );
					}

					// Sort categories from smallest to largest
					categoryArray.sort(function(a, b){

						var a = a[1];
						var b = b[1];
						return a.metricOrder.length - b.metricOrder.length;

					});

					// Start with the largest category and add to the array
					// Add metrics with permuted pairs first
					// Original metrics
					for( var i = categoryArray.length - 1; i > 0 ; i-- ) {
						// Add original 
						if( categoryArray[i][1].isPermuted ){

							var obj = categoryArray[i][1];

							var metricArray = [];
							

							for(var j = 0; j < obj.metricsOriginal.length; j++){

								metricArray.push( obj.metricsOriginal[ j ] );

							}

							// Add category
							this.orderedCategories.push( {name: obj.name, metrics: metricArray } );

						} else {

							categoriesToBeAdded.push( categoryArray[i] );

						}
				
					}

					// Add metrics without permuted pairs
					for( var i = 0; i < categoriesToBeAdded.length; i++ ) {
						if(!categoriesToBeAdded[i][1].allString){
							// Add metrics
							var obj = categoriesToBeAdded[i][1];

							var metricArray = [];

							// console.log(obj);
							// console.log(obj.metricOrder);

							for(var j = 0; j < obj.metricOrder.length; j++){
								if(obj.metrics[ obj.metricOrder[ j ] ].dataType != "String"){
									
									metricArray.push( obj.metricOrder[ j ] );

								}
							}

							// Add category
							this.orderedCategories.push( {name: obj.name, metrics: metricArray } ); 
						}
					
					}

					// Add metrics with permuted pairs again
					// Permuted metrics
					for( var i = 0; i < categoryArray.length ; i++ ) {
						
						// Add permuted 
						if( categoryArray[i][1].isPermuted ){
							var obj = categoryArray[i][1];

							var metricArray = [];

							for(var j = obj.metricsPermuted.length-1; j > -1 ; j--){

								metricArray.push( obj.metricsPermuted[ j ] );

							}

							// Add category
							this.orderedCategories.push( {name: obj.name, metrics: metricArray } ); 
						}

					}

					return this.orderedCategories;
			
				},
				getOrderedCategories: function ( ) {
					if( !this.orderedCategories ) {

						return this.orderCategories();
					} else {
						return this.orderedCategories;
					}
				},
				isString: function ( type ) {

					if( this.metrics[ type ][ "dataType" ] == "String") {
						return true;
					} else {
						return false;
					}
				},
				setColorScheme: function ( dataKey, heatmapKey , colorscheme ) {
					
					for( var prop in this.metrics ){	

						this.metrics[ prop ].setColorScheme( dataKey , heatmapKey , colorscheme );

					}

				},
				getMetricCount: function ( type ) {


					if ( type ) {

						var list = []; // List of grid objects 

						if ( type === "grid" ) {

							for ( var prop in this.metrics ) {

								if ( this.metrics[prop].visualizationType.grid ) {

									list.push(this.metrics[prop].label);

								}

							}

							return list.length;

						}


					} else {

						return this.metricList.length;

					}
					
				}
			};

			var Category = function ( name , permuted ) {
				this.name =  name;
				this.metrics = {};
				this.metricOrder = [];
				this.metricsOriginal = [];
				this.metricsPermuted = [];

				if( permuted ){
					this.isPermuted = true;
				} else {
					this.isPermuted = false;
				}

			} 
			Category.prototype = {
				add: function ( metric ) {
					thisObj = this;

					// Add metric to global list
					thisObj.metrics[ metric.key ] = metric;

					if ( metric.permuted && (metric.category.index || metric.category.index == 0) ) {

						if( metric.permuted.type === "original" ){
							
							// insert into original
							thisObj.metricsOriginal[ metric.category.index ] = metric.key;
						
						} else {

							// insert into permuted
							thisObj.metricsPermuted[ metric.category.index ] = metric.key;

						}
					
					} 
						
					if(METRIC_PROP.CATEGORY_TYPES[metric.category.name] && METRIC_PROP.CATEGORY_TYPES[metric.category.name].allString == true ){
						thisObj.allString = true;

					} else {
						thisObj.allString = false;
					}
					
					var lastPosition = this.metricOrder.length;
					this.metricOrder[ lastPosition ] = metric.key;

				}
			};

			// Class MetricInstance
			// Holds a metric and associated specifications for that metric.
			var MetricInstance = function( type ){
				if( type ){
					
					this.label;
					this.dataType;
					this.domainType;
					this.visualizationType = {};
					this.domainVal = {
						global: {}
					};
					this.key = type;

					this.colorScale = {
						global: {}
					};

					var rPermuted = /(new)/g;
					var label = ""; // Holds "new" if metric identified as permuted
					var permutedData = {
						type: "original"
					};

					if ( type.match( rPermuted 	) ) {
				
							type = type.replace(rPermuted, "");
							label = "New ";
							permutedData = {
								type: "permuted"
							}
				
					}
					
					// If metric type exists in USG.constants
					if( METRIC_PROP.METRIC_TYPES[ type ]) {

						for( var prop in METRIC_PROP.METRIC_TYPES[ type ] ){

							// Insert "new" if label
							if( prop == "label" ){

								this[ prop ] = label + METRIC_PROP.METRIC_TYPES[ type ][ prop ];

							} else {

								this[ prop ] = METRIC_PROP.METRIC_TYPES[ type ][ prop ];

							}
							
						}

						if ( this.permuted ) {
							this.permuted = permutedData;
						}

					} else {

						// Default metric settings
						this.label = this.key; // Name of the metric, for putting into arrays, etc.
						this.dataType = "String"
						// Standard maximum and minimum values for this metric
						this.domainType = METRIC_PROP.DOMAIN_TYPES.MIN_MAX;

					}

					// Determine if can be visualized by a grid
					if( this.dataType == "String" ) {
						this.visualizationType.grid = false; // Cannot be visualized by a grid
					} else {
						this.visualizationType.grid = true;
					}

				} else {
					console.log("Error: MetricInstance constructor missing type name. ")
				}

			};
			MetricInstance.prototype = {
				setDomain: function ( dataset , dataLocation ) {
					var thisObj = this; // The current Metric Instance
					this.domainVal[ dataLocation ] = {}; // Stores max and min for the current dataset

					// If domain type not null (meaning it's a string), set the domain values
					if ( this.domainType ) {

						// Min needs to be calculated
						if ( this.domainType.min === "min" ) {

							// Find and store minimum for current dataset
							var newDataMin = d3.min( dataset , function (d) { return d[ thisObj.key ]; });
							this.domainVal[ dataLocation ].min = newDataMin;

							// Compare with existing global minimum and store result
							this.domainVal.global.min = d3.min([ newDataMin, thisObj.domainVal.global.min]);

						// There is the same min for all datasets
						} else {

							// Set the min for this dataset
							this.domainVal[ dataLocation ].min = this.domainType.min;
							
							// Initialize global min
							if(!this.domainVal.global.min) {
							
								this.domainVal.global.min = this.domainType.min;
							
							}
							
						}

						// Max needs to be calculated
						if ( this.domainType.max === "max" ) {
							
							// Find and store maximum for current dataset
							var newDataMax = d3.max( dataset , function (d) { return d[ thisObj.key ]; });
							this.domainVal[ dataLocation ].max = newDataMax;

							// Compare with existing global maximum and store result
							this.domainVal.global.max = d3.max([ newDataMax, thisObj.domainVal.global.max]);

						// There is the same max for all datasets
						} else {
							
							// Set the max for this dataset
							this.domainVal[ dataLocation ].max = this.domainType.max;
							
							// Initialize global max
							if(!this.domainVal.global.max) {
							
								this.domainVal.global.max = this.domainType.max;
							
							}
					
						}

					}
				},
				setColorScheme: function ( key , heatmapKey , colorscheme ) { 
					var thisObj = this;

					if ( thisObj.domainType ) {	
					
						var min =  thisObj.domainVal[ key ].min;
						var max =  thisObj.domainVal[ key ].max;
	 					var domain = [min, max];
	
						if( !this.colorScale[ key ] ){
							this.colorScale[ key ] = {};
						}
	
						this.colorScale[ key ][ heatmapKey ] = d3.scale.quantile()
							.domain(domain)
							.range(colorscheme);
					}
				}
			}
			
			/* Public Methods */

			// Create metric and return it
			var createSet = function( ){

				return new MetricSet( );
			
			};

			return {

				createSet: createSet
	
			};
		})();

		var gui = ( function(){
			
			/* Private Methods */
			// HTML to be loaded
			var EXTERNAL_HTML = {
				initialize: "html/visualizations-holder.html"
			}


			/* Public Methods */
			var initialize = function ( callback ) { 
				// Load external html: Navigation, main 
				$("#USG-body").load(EXTERNAL_HTML.initialize, function done () {
					
					// Calculate navbar height
					var navHeight = $('#navbar-main').outerHeight() + 20;
					// Calculate how tall the visualization should be
					var vizHeight = $('body').outerHeight() - navHeight;

					// Adjust height of visualization container to maximum height
					$("#vizualizations-holder, #vizualizations-holder-container").css("height", vizHeight);

					$("#loadingScreen").hide(); // Hide loading screen div
					callback();
				});

			};
			

			return {
				initialize: initialize
			};
		})();

		// Public methods
		return {
			// Create environment
			create: create,

			// Components of an environment
			metric: metric
		};
	
	})();
}).apply( USG.visualization );

$( document ).ready( function(){
	
	var environment;

	var printtoC = function(){
	
		environment.addHeatmapSet( "catCode-results-1hundred-2015-01-15" , "default" );
	
	};
	
	var loadData = function () {
	
		environment.loadData( "catCode-results-1hundred-2015-01-15.csv", printtoC );
	
	}

	environment = USG.visualization.environment.create( loadData , "#USG-body" );

});







	
