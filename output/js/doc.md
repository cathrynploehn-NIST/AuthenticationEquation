# USG.visualization.environment

Data types:
 - dataLocation: String referring to the file location of a dataset (with .csv or .txt). Used as a unique key for each dataset (without .csv or .txt)


Classes: 

- __EnvironmentInstance.__ - Holds a dataset and associated visualizations for that dataset.
  - _Properties_:
  	  - __datasets__ : Array. Holds array of dataset objects loaded using loadData().
  	  - __metricSet__ : MetricSet. Holds set of metric objects representing all datatypes in datasets[]. Created when loadData succeeds in loading data to the class.
  	  - __this.visualizations__ : Array. Holds array of visualization objects for that environment instance. 

  - _Methods_: 

	  - __addHeatmapSet( dataLocation: String, config: String )__: adds a HeatmapSet with the data location specified and the configuration specified.
	  	configurations available: "default"
	  	See heatmap.create();
	  - __loadData(url, callback)__: loads .csv file at the specified location and adds it to the environment object


Public Methods:

- __environment.create( callback: function )__ - returns EnviromentInstance class. Exececutes callback function when asynchronous functions done.

## (...).environment.heatmap
Templates for heatmap visualization. Holds sets of heatmaps. 

Classes:

- __HeatmapSet.__ Holds a dataset and associated visualizations for that dataset.
	- _Properties_:
		- __key__ : Key for specific heatmap.
		- __dataKey__ : Key for data heatmap is representing.
		- __tiers__ : Holds tiers contained in this specific heatmap.
		- __metricSet__ : Array. Holds set of metric objects representing all datatypes in containing visualization.
		- __dataset__ : Dataset this visualization is representing.
		- __colorscheme__ : Array. Array of colors to be used for visualization. 

	- _Methods_:
		- __setMetricColorScheme()__ : Set color scheme for metricSet using the heatmap key.

Returned Methods:

- __heatmap.create( dataKey: String , visualizationKey: String , dataset: dataset obj , config: String , metricSet: MetricSet )__ - create HeatmapSet with specified dataset key (dataLocation), visualization key (visualizationKey), dataset, configuration ( "default", etc. )

### (...).heatmap.gui
GUI properties for the this (heatmap) visualization type. 

Constants:
	- EXTERNAL_HTML: String. Url to the heatmap html template file to be loaded.

### (...).heatmap.tier

Classes:

- __TierInstance.__ Generic version of heatmap grid
	
	- _Properties_:
		- __key__ : Key for specific heatmap the tier is contained in.
		- __dataKey__ : Key for data the tier is representing.
		- __dataset__ : Dataset the tier is representing.
		- __metricSet__ : Array. Holds set of metric objects representing all datatypes in containing visualization.
		- __gridmetricSet__ : Symmetrical ordered list of metric names.

		-__svg__ : Holds properties for the svg(s) inside this tier. 

		-__html__ : Holds properties for the html container of this tier.

		

	- _Methods_:
		- __setMetricColorScheme()__ : Set color scheme for metricSet using the heatmap key.

- __Tier1.__ Small view with scrollbar.

- __Tier2.__ Medium view, scrolls.

- __Tier3.__ Close up view.


Returned Methods:

- __tier.create(type)__ - create tier. 
	- @param 
		- type: int, specifies which typer of tier to create

## (...).environment.metric

Classes:

- __MetricInstance.__ - Holds a metric and associated specifications for that metric.

## (...).environment.gui

Methods:

- __gui.initialize( callback: function )__ - set up initial screen properties for the tool. Execute callback when done

