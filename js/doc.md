# USG

##Properties
- this.currentEnvironment: Current environment variable (see USG.environment)
- this.showExample: Flag determining whether example data is shown

##USG.constants
Metric and visualization constants

###USG.constants.metric
Metric definitions.

- METRIC_TYPES: Define metric properties.
- CATEGORY_TYPES: Define properties for each metric category, if necessary.
- DOMAIN_TYPES: Shorthand for types of domains each metric can have.

###USG.constants.colors
Color constants.

- colorbrewer: Holds color values for different scales

## USG.environment
Controls the visualizations, datasets uploaded, and metric types.

####Classes: 

- __EnvironmentInstance.__ - Holds a dataset and associated visualizations for that dataset.
  - _Properties_:
	- __createData__ : Object representing the namespace "environment.dataset." Used to create new datasets.
	- __datasets__ : Array. Holds array of Dataset objects loaded using loadData().
	- __metricSet__ : MetricSet. Holds set of metric objects. This set represents metadata for all datatypes in datasets[]. New metrics are created when loadData succeeds in loading data to the class and a datatype is not already in the MetricSet. MetricSet starts with 0 metrics until the first dataset is loaded.  
	- __visualizations__ : Array. Holds array of visualization objects for that environment instance. 
	- __datasetCount__: Number of datasets in this.datasets (see above)

  - _Methods_:
	- __addVisualization( dataLocation: String )__: adds a visualization with the data location. 
	- __loadData( thisObj: EnvironmentInstance , dataLocation: String,  callback: Function ) _( asychronous )___: loads .csv file at the specified url location. The loaded data is used to create a Dataset object. If metrics in the dataset don't exist, new metrics are created in the _metricSet_ property. Global domains of each metric are reset and data-specific domains are set using the new data.
	- __alertMessage( msg: String )__: Updates GUI header with a bootstrap alert in Yellow.
	- __parseData( name: String, file: File , callback: Function ) _( asychronous )___: Parses a file into CSV format. Creates metric objects used in the visualization
	- __processData( thisObj: EnvironmentInstance , dataLocation: String , data: Data , callback: function )__: Processes a file into CSV format and loads as a visualization. Creates metric objects used in the visualization
	- __clear()__: Empty the environment

  - _On initialization_:

	  - gui.initialize ( asychronous ) called.


####Public Methods:

- __this.create( callback: function )__ - returns EnviromentInstance class. Exececutes callback function when asynchronous functions done.


## environment.dataset
Templates and associated operations for dataset objects.

####Classes:

- __DatasetInstance__ Holds a dataset and associated methods to perform on that dataset.
	- _Properties_:
		- __dataset__ : Array. Holds data.
		- __metrics__ : List of which metrics the data has.
		
	- _Methods_:
		- __hasMetric( metricName )__ : Returns whether the dataset has that type of data.
		- __sortData( byMetricType )__ : Sorts data by passed metric type.
		- __getData()__ : Returns stored dataset.

	- _On initialization_:
		- Adds represented data in metrics[] according to dataset[0].

####Returned Methods:

- __dataset.create( data: Array )__ - Returns new DatasetInstance using passed data to create the object. 


## environment.visualization
Templates for visualization. 

####Classes:

- __VisualizationInstance.__ Holds a dataset and associated visualizations for that dataset.
	- _Properties_:
		- __key__ : String. Key for specific heatmap.
		- __container__: String. Key for the html container
		- __dataKey__ : String. Key for data heatmap is representing.
		- __tiers__ : String. Holds tiers contained in this specific heatmap.
		- __metricSet__ : Array. Holds set of metric objects representing all datatypes in containing visualization.
		- __datasets__ : Array. Datasets this visualization is representing.
		- __colorscheme__ : Array. Array of colors to be used for visualization. 
			- Normal: default color scheme
			- Highlight: color scheme used for hovering and other similar functions.

	- _Methods_:
		- __init()__ : Create and initialize visualization tiers
		- __addData( dataLocation:String , visualizationKey: String , dataset: Array )__: Add new data and revisualize tiers if necessary
		- __setMetricColorScheme()__ : Set color scheme for metricSet using the heatmap key.
		- __createTiers( whichTiers: Array, dataset: Array , mode: String )__ : Create and add tiers to this object. Each index in whichTiers array represents a new tier to create. The value of each index represents the type of tier to create.
		- __createTier( whichTiers: Array, dataset: Array , mode: String )__ : Create and add single tier to this object. 
		- __connectTiers( whichTiers: Array )__ : Connect tiers to each other. Connected tiers will be able to trigger one another when interacted with. whichTiers is an array of the indexes of this.tiers[] to be connected. whichTiers[0] is the tier to be connected to whichTiers[i].
		-__initializeTiers( deferred: Deferred )__: Initialize tiers in the visualization object (create SVG and visualize)
		-__addHTML( tiers: Array[Tiers] )__: Append html from tiers to the browser.

	- _On initialization_:
		- setMetricColorScheme(): Sets the default color scheme for metrics. 
		- setDefaultVisibility( dataKey, key ): Sets the default visibility for metrics.
		- Create and initialize tiers associated with the configuration of the heatmap.
		- Load html to the browser. 


####Returned Methods:

- __visualization.create( dataKey: String , visualizationKey: String , dataset: dataset obj , config: String , metricSet: MetricSet )__ - Create and return HeatmapSet object with specified dataset key (dataLocation), visualization key (visualizationKey), dataset, configuration ( "default", etc. )

### (...).visualization.gui
GUI properties for the this (heatmap) visualization type. 

Accessible Constants:
	- EXTERNAL_HTML: String. Url to the heatmap html template file to be loaded.

### (...).visualization.tier
Templates for creation of tiers, or heatmap grids, which are modules of a HeatmapSet. 

####Classes:

- __TierInstance.__ Generic version of visualization tier
	
	- _Properties_:
		- __key__ : String. Key for specific tier within the heatmap it is contained in.
		- __parentKey__ : String. Key for specific heatmap the tier is contained in.
		- __dataKey__ : String. Key for data the tier is representing.
		- __dataset__ : String. Dataset object for the data the tier is representing.
		- __metricSet__ : String. Array. Holds MetricSet object representing all datatypes in containing visualization.
		-__svg__ : Object. Svg object for this tier. Holds dimensions of 
		-__html__ : Holds properties for the html container of this tier.
			-__parentContainer__ : String. id of container element.
			- __id__ : String. id where html of this tier is contained.
			- __url__ : String. url location of where the html of this tier is contained.
			- __markup__: String. Once loadHTML() is used, stores HTML markup of this tier.
		-__grid__ : Properties for the grid visual of this tier
			- __size__ : 
				- width : Integer. Width of grid block
				- height : Integer. Height of grid block
		-__margin__ : Global margin of this tier
			- top
		- __type__ : Integer. Type of tier.
		- __connectedTiers__ : Array. Connected tiers. Can be triggered via interactions with this tier. 
		- __hiddenRows__: Object. Lists rows that are hidden along with their d3 selections for editing. 
		- __totalGutterCount__ : Tracks the total count of gutters ( spaces between column categories ). Counted in this.countGutters();


	- _Methods_:
		- __loadHTML() _( asychronous )___ :  Loads html into this.html. Returns deferred promise object.
		- __countGutters()__ : Counts the total count of gutters ( spaces between column categories )
		- __visualize()__ : Establishes the visuals of the tier. Needs to be implemented by a subclass. 
		- __createsvg__ : Defines svg properties and creates svg objects for the tier. Needs to be implemented by a subclass. 
		- __initialize()__ : Starts up the visualization of the tier. Initializes all properties.
		- __getHTML()__ : Returns the HTML markup of this tier. 
		- __draw()__ :
		- __ __ : 

- __Tier1.__ Small, overhead view.

- __Tier2.__ Medium view.

- __Tier3.__ Close up view.


####Returned Methods:

- __tier.create(type)__ - create tier. 
	- @param 
		- type: int, specifies which typer of tier to create

## (...).environment.metric

####Classes:

- __MetricInstance.__ - Holds a metric and associated specifications for that metric.

## (...).environment.gui

####Methods:

- __gui.initialize( callback: function )__ - set up initial screen properties for the tool. Execute callback when done

