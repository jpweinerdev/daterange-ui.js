/*!
 * daterange-ui.js 1.0.0
 * https://github.com/jpweinerdev/daterange-ui.js
 *
 * @license MIT (https://github.com/jpweinerdev/daterange-ui.js/blob/master/LICENSE)
 *
 * @copyright 2021 http://developer.jpweiner.net/daterange.html - A project by Jean-Pierre Weiner - Developer
 */


// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;( function( $, window, document, d3, undefined ) {

	"use strict";

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variables rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "daterangeselect",
			defaults = {
				container: '#graph',
				height: 320,
				rangeBarOpacity: 0.4,
				handleScaleFactor: 1.6,
				dataLengthTrigger: 30
			};
			
			
		var DateRange = {
			selectedRange: [],
			currentBarData: {},
			
			setRange: function(r1, r2) {
				this.selectedRange = [r1, r2];			
			},
			getRange: function() {
				return this.selectedRange;
			},
			
			clearRange: function() {
				this.selectedRange = [];			
			}, 

			setCurrentBarData: function(d) {
				this.currentBarData = d;
			},
			getCurrentBarData: function() {
				return this.currentBarData;
			},

			updateSelectedRange: function() {
				return this.getRange();
			},
			
			hoverText: function() {
				return this.getCurrentBarData().key_as_string;
			},


			//set the plugin options
			updateGraphSettings: function(settings) {
				if(typeof settings === "object") {
					
					this.graph.container = settings.container;
					this.graph.height = settings.height;
					this.graph.slider.rangeBarOpacity = settings.rangeBarOpacity;
					this.graph.slider.handleScaleFactor = settings.handleScaleFactor;
					this.graph.dataLengthTrigger = settings.dataLengthTrigger;
					
				}
				
				
			},
			
			

			graph: {
				container: "#graph",
				height: 320,
				svg: 'undefined', //svg container
				svgg: 'undefined', //= bars g
				data: 'undefined', //dates data from backend
				datasetSize: 100, //how many years //init???
				dataLengthTrigger: 30,
				xAxis: 'undefined',
				dates: [],
				getDimensions: function() {
					var bounds = d3.select(this.container).node().getBoundingClientRect();
					var margin = {top: 20, right: 20, bottom: 50, left: 40},
						width = bounds.width - margin.left - margin.right,
						height = this.height - margin.top - margin.bottom;
						
						
					return {
						margin: margin,
						width: width,
						height: height,
						bounds: bounds,
						svgWidth: width + margin.left + margin.right,
						svgHeight: height + margin.top + margin.bottom
					};
				},
				x: 'undefined', //scale of bar graph
				y: 'undefined', //scale of bar graph
				

				slider: {
					rangeBarOpacity: 0.4,
					handleScaleFactor: 1.6,
					domainNames: {},
					scale: {},
					value: {},
					mouseMargin: {
						min: 0,
						max:0
					},
					handleMargin: {
						min: 0,
						max:0
					},
					setDomain: function() {
						this.domainNames = d3.scaleBand()
							.domain(DateRange.graph.data.map(function(d) { return d.key_as_string; }))
							.range([0,DateRange.graph.getDataSize()]);
					},
					getScale: function() {
						var domain = [0,DateRange.graph.getDataSize()-1]; //entries index
						var rangelength = [0,DateRange.graph.x.range()[1] - DateRange.graph.x.step() - ((DateRange.graph.x.step() - DateRange.graph.x.bandwidth()))]; //size of slider + 
										
						this.scale = d3.scaleLinear().range(domain).domain(rangelength);
						this.value = d3.scaleLinear().domain(domain).range(rangelength);
						
			
						return {
							scale: this.scale,
							value: this.value
						};
					},
					
					getCenterPositionOfBar: function(d, i) {
						
						return { 
							x: this.value(i)+40+DateRange.graph.x.step()/2,
							y: DateRange.graph.y(d.doc_count)
						};
					},
					
					getMouseMargin: function() {
						this.mouseMargin.min = DateRange.graph.x.step()/2;
						this.mouseMargin.max = DateRange.graph.x.range()[1] - DateRange.graph.x.step()/2;						
						
						return this.mouseMargin;			
					},
					
					setInitialHandleMargin: function() {
						//prevent overlap of other handle
						this.handleMargin.min = DateRange.graph.x.step()/2 + DateRange.graph.x.step(); //left handle
						this.handleMargin.max = DateRange.graph.x.range()[1] - DateRange.graph.x.step()/2 - DateRange.graph.x.step(); //right handle
					},
					setMinHandleMargin: function(newValue) {
						this.handleMargin.min = newValue;
					},
					setMaxHandleMargin: function(newValue) {
						this.handleMargin.max = newValue;
					},
					getHandleMargin: function() {
						return this.handleMargin;
					},
					updateHandleMarginOnResize: function() {
						//recalculated handlepositions
						var updatedPos = this.getUpdatedHandlePosition();
						
						this.handleMargin.min = updatedPos.min + DateRange.graph.x.bandwidth();
						this.handleMargin.max = updatedPos.max - DateRange.graph.x.bandwidth();
					},
					
					getInitialHandlePosition: function() {
						var scaleObj = this.getScale();
						
						return {
							min: scaleObj.value(0) + DateRange.graph.x.step()/2,
							max: scaleObj.value(DateRange.graph.getDataSize()-1) + DateRange.graph.x.step()/2,
							bottom: DateRange.graph.y.range()[0] + 6
						}
					},
									
					getUpdatedHandlePosition: function() {
						var scaleObj = this.getScale(); //this will update scale !important
						var selectedRange = DateRange.getRange();
						
						return {
							min: scaleObj.value(this.domainNames(selectedRange[0])) + DateRange.graph.x.step()/2,
							max: scaleObj.value(this.domainNames(selectedRange[1])) + DateRange.graph.x.step()/2,
							bottom: DateRange.graph.y.range()[0] + 6
						}
					
					},
					
					removeSliderControlls: function() {
						DateRange.graph.svg.select(".handles").remove();
					},
					
					
					initSlider: function() {
						this.setInitialHandleMargin();
					
						//init slider
						this.setDomain();
						DateRange.setRange(this.domainNames.domain()[0], this.domainNames.domain()[DateRange.graph.getDataSize()-1]); //initial full range				
					}			
				},
				
							
				calculateDates: function() {
				
					this.dates = this.data.map(function(d) { return d.key_as_string; });
					return this.dates;
				},
				
				getDates: function() {
					return this.dates;
				},
				
				//mark selected range in diagram UI
				//range: range names
				updateSelectorRangeAndDiagram: function(range) {
					var bars = this.svgg.selectAll(".bar");
					var start = false;
										
					bars.each(function(d, i){
						d3.select(this).raise().classed("selected", false);
						
						if(d.key_as_string == range[0]) {
							start = true;						
						}
						
						if(start) d3.select(this).raise().classed("selected", true);
						
						if(d.key_as_string == range[1]) {
							start = false;
						}
					});				
									
					DateRange.setRange(range[0], range[1]); //names
				},
				
				setData: function (data) {
					this.data = data;
					
				},
				getDataSize: function() {
					if(this.data === 'undefined') {
						return 0;
					} else {
						return this.data.length;
					}
					
				},
				clearData: function() {
					this.data = 'undefined';
					this.datasetSize = 0;
				},
				
				setDatasetSize: function(size) {
					this.datasetSize = size;
				},
				
				getDatasetSize: function() {
					return this.datasetSize;
				},
				
				
				
				
				drawSlider: function() {
					var _this = this;
					var tmpEventStop = 0;
					var data = this.getDates();
					var dimensions = DateRange.graph.getDimensions();				
					var initialHandlePosition =  this.slider.getInitialHandlePosition();				

					var selectorRange = [data[0], data[data.length-1]]; //initial
					
					var handle = 'M-5.5,-5.5v10l6,5.5l6,-5.5v-10z';
					
		
					
					var dragstarted = function(d){
						var currentHandle = d3.select(this);
						var rangeindicator = _this.svg.select(".handles .range");
						
						currentHandle.raise().classed("active", true);
						
						rangeindicator
							.attr("y", initialHandlePosition.bottom - 4)
							.attr("x", _this.slider.getHandleMargin().min - _this.x.bandwidth())							
							.attr("width", _this.slider.getHandleMargin().max - _this.slider.getHandleMargin().min + _this.x.bandwidth()*2)
							.transition().duration(300)
								.attr("opacity", _this.slider.rangeBarOpacity);
						
					
						
						//handle text under handle on drag
						currentHandle.append("text")
							.attr("text-anchor", "middle")
							.attr("class", "handlehovertext")
							.attr("dx",0)
							.attr("dy",37)
							.text("");
					};
					
					
					
					var dragged = function(d) {
						var currentHandle = d3.select(this);
						var txt = currentHandle.select("text");
						var lowDataHitsBreakPoint = _this.dataLengthTrigger;
												
						var scaleObj = _this.slider.getScale();
						var mouseMarginMinMax = _this.slider.getMouseMargin();
						
						
						var indexPosition = Math.floor(scaleObj.scale(d3.event.x));
						var stopPosition = scaleObj.value(indexPosition) + _this.x.step()/2;
						var currentStopYear = data[indexPosition];
						var handleType = currentHandle.attr("class").includes("start") ? 'start' : 'end';	

						var rangeindicator = _this.svg.select(".handles .range");
							
						
						if(indexPosition != tmpEventStop && d3.event.x > mouseMarginMinMax.min && d3.event.x < mouseMarginMinMax.max) {						
							
							if(handleType == 'start') {

								if(d3.event.x < _this.slider.getHandleMargin().max) {
									tmpEventStop = Math.floor(scaleObj.scale(d3.event.x));
									_this.slider.setMinHandleMargin(stopPosition+_this.x.bandwidth());
									currentHandle.attr('transform', 'translate('+(stopPosition)+',' + initialHandlePosition.bottom + ')');
									selectorRange[0] = currentStopYear;
									_this.updateSelectorRangeAndDiagram(selectorRange);
								}
								
								if(data.length > lowDataHitsBreakPoint && tmpEventStop > 0 && tmpEventStop < data.length-1) txt.text(function(){ return selectorRange[0]; }); else txt.text("");
								
							} else {

								if(d3.event.x > _this.slider.getHandleMargin().min) {
									tmpEventStop = Math.floor(scaleObj.scale(d3.event.x));
									_this.slider.setMaxHandleMargin(stopPosition-_this.x.bandwidth());
									currentHandle.attr('transform', 'translate('+(stopPosition)+',' + initialHandlePosition.bottom + ')');
									selectorRange[1] = currentStopYear;
									_this.updateSelectorRangeAndDiagram(selectorRange);
								}

								if(data.length > lowDataHitsBreakPoint && tmpEventStop > 0 && tmpEventStop < data.length-1) txt.text(function(){ return selectorRange[1]; }); else txt.text("");
							}							
														
						}
						
						//update range bar on drag
						rangeindicator
							.attr("x", _this.slider.getHandleMargin().min - _this.x.bandwidth())							
							.attr("width", _this.slider.getHandleMargin().max - _this.slider.getHandleMargin().min + _this.x.bandwidth()*2);

					};

					var dragended = function(d) {
						var currentHandle = d3.select(this);
						var rangeindicator = _this.svg.select(".handles .range");
						
						rangeindicator.transition().duration(300)
							.attr("opacity", 0);
							
							
						currentHandle.classed("active", false);
						currentHandle.select("text").remove();
						
						DateRange.updateSelectedRange();					
										
						
					};
					
					
					//INIT SLIDER RANGE etc.
					this.slider.initSlider();								
					this.svg.select(".handles").remove(); //remove handles first
					
							
					d3.select(this.container+" svg")
					.append("g")
						.attr("class", "handles")
						.attr('transform', 'translate('+(dimensions.margin.left + (this.x.step() - this.x.bandwidth())/2)+',' + dimensions.margin.top + ')');
						
						
					//add range bar indicator (initial)
					this.svg.select(".handles").append("rect")
							.attr("class", "range")
							.attr("x", 0)
							.attr("y", 0)
							.attr("width", dimensions.width)
							.attr("height", 8)
							.attr("opacity", 0);

						
					
					this.svg.select(".handles")
						.append("g")
							.attr("class", "selector start")
							.attr('transform', 'translate('+(initialHandlePosition.min)+',' + initialHandlePosition.bottom + ')')
							.attr("font-family", "sans-serif")
							.attr("text-anchor", "middle")						
							.append("path")        
							.attr("d", handle)
								.attr('transform', 'scale('+this.slider.handleScaleFactor+')'); //handle scale
							
						
					this.svg.select(".handles")
						.append("g")
							.attr("class", "selector end")
							.attr('transform', 'translate('+(initialHandlePosition.max)+',' + initialHandlePosition.bottom + ')')
							.attr("font-family", "sans-serif")
							.attr("text-anchor", "middle")
							.append("path")        
							.attr("d", handle)
								.attr('transform', 'scale('+this.slider.handleScaleFactor+')'); //handle scale	
							
					
					this.svg.selectAll(".handles .selector")
						.on("mouseover", function (d) { 
							d3.select(this).style("cursor", "e-resize")
								.classed("hovereffekt", true);
								
						})
						.on("mouseout", function (d) {
							d3.select(this)
								.classed("hovereffekt", false);							
						})
						.call(d3.drag()						
							.on("start", dragstarted)
							.on("drag", dragged)
							.on("end", dragended));
							
					



					
					/* Remove HANDLES if initialized with []*/					
					if(this.data.length == 0) {
						this.slider.removeSliderControlls();						
					} 
					
					
				},
				
				updateSlider: function() {
					var _this = this;
					var tmpEventStop = 0;
					var handleStart = this.svg.select(".handles .selector.start");
					var handleEnd = this.svg.select(".handles .selector.end");
					var selectedRange = DateRange.getRange();
					var handlePosition = this.slider.getUpdatedHandlePosition();				
					var selectorRange = [selectedRange[0], selectedRange[1]]; //names
					
					var rangeindicator = this.svg.select(".handles .range"); 
													
					this.slider.updateHandleMarginOnResize(); //recalculate handle posistions
					
					this.updateSelectorRangeAndDiagram(selectorRange); //new and updated bars will always be selected
					
					handleStart.attr('transform', 'translate('+handlePosition.min+',' + handlePosition.bottom + ')');
					handleEnd.attr('transform', 'translate('+handlePosition.max+',' + handlePosition.bottom + ')');
					
					//update range bar indicator (resize)
					rangeindicator
						.attr("y", handlePosition.bottom - 4)
						.attr("x", handlePosition.min)
						.attr("width", handlePosition.max - handlePosition.min);
					
					
					
				},
				

				
				//init the graph
				drawGraph: function() {
					
					
					var dimensions = DateRange.graph.getDimensions();

					var _this = this;
					var div = d3.select(this.container).append("div")	
						.attr("class", "tooltip")				
						.style("opacity", 0);	

					
					this.x = d3.scaleBand().range([0, dimensions.width]).padding(0.1);
					this.y = d3.scaleLinear().range([dimensions.height, 0]);

					
					
					this.svg = d3.select(this.container).append("svg")
						.attr('width', dimensions.svgWidth)
						.attr('height', dimensions.svgHeight);
						
					this.svgg = this.svg.append("g")
						.attr("class", "bars")
						.attr('transform', 'translate('+dimensions.margin.left+',' + dimensions.margin.top + ')');
						
							  
					//format the data
					this.data.forEach(function(d) {
						d.doc_count = +d.doc_count;
					});

					
					//add the x Axis
					this.svgg.append("g")
						.attr("class", "axis axis--x")
						.attr('transform', 'translate(0,' + dimensions.height + ')');
						

					//add the y Axis
					this.svgg.append("g")
						.attr("class", "axis axis--y");
		

					
					this.updateGraph();
					
					this.initOnWindowResize();
					
			  
					
				},
				
				updateGraph: function() {
					var _this = this;
					var dimensions = this.getDimensions();
					var bars = 'undefined';
					var lowDataHitsBreakPoint = this.dataLengthTrigger; //change display when data amount is lower
					// Define the div for the tooltip
					var div = d3.select(this.container+" div.tooltip")				
						.style("opacity", 0);
						
					var tickLineLengthFirstLast = function(d,i) {
						//length of line
						if(_this.data.length <= lowDataHitsBreakPoint) {
							//all lines printed
							if(i == 0 || i == _this.data.length) return 32; else return 22; 
						} else {
							//only first, last and every 10th
							if(i == 0 || i >= (Math.floor((_this.data.length)/10+2))-1) return 32; else return 22;
						}				
					};
					
					var tickTextPosition = function(d,i) {
						if(_this.data.length <= lowDataHitsBreakPoint) {
							if(i == 0 || i == (_this.data.length-1)) return '1.9em'; else return '0.9em';
						} else {
							if(i == 0 || i >= (Math.floor((_this.data.length)/10+2))-1) return '1.9em'; else return '0.9em';
						}
					};
					
					var tickValueFilterDisplay = function(d, i) {						
							
						if(_this.data.length <= lowDataHitsBreakPoint) {
							return true;
						} else {
							if(i == 0 || i == _this.data.length-1 || d*1 % 10 == 0) return true; else return false;
						}
					};
						
						
					var mouseover = function(d,i) {
					
						var stopCoordinates = _this.slider.getCenterPositionOfBar(d, i);

						var generateHoverText = function(d) {
							DateRange.setCurrentBarData(d);
							
							return DateRange.hoverText();							
						}
						
					
						div.transition()
							.duration(200)
							.style("opacity", .9);
							
						div.html(generateHoverText(d))
							.style("left", (stopCoordinates.x - 20) + "px")		
							.style("top", (stopCoordinates.y - 18) + "px");

						d3.select(this).classed("highlight", true);

					};
					
					var mouseout = function(d) {							
						div.style("opacity", 0)
							.style("left", "-1000px")		
							.style("top", "-1000px"); //out of sight
							
						d3.select(this).classed("highlight", false);						
					};
					
					this.svg.select('.empty').remove();//remove emty message
					
					this.x = d3.scaleBand().range([0, dimensions.width]).padding(0.1);
					
					this.x.domain(this.calculateDates());
					this.y.domain([0, d3.max(_this.data, function(d) { return d.doc_count; })]);
					
					this.xAxis = d3.axisBottom(this.x).ticks(10).tickValues(this.x.domain()
						.filter(tickValueFilterDisplay))
						.tickSize(20,0);

					d3.select(this.container + ' svg .bars .axis--y')
						.call(d3.axisLeft(this.y));
					

					



					//append the rectangles for the bar chart
					//enter			
					bars = this.svgg.selectAll(".bar") 
						.data(_this.data);
						
					bars.enter()						
						.append("rect")
							.style('opacity', 1)
							.attr('class', 'bar')
							.classed('selected', true)
							.attr('x', function(d, i) { return _this.x(d.key_as_string); })
							.attr('width', this.x.bandwidth())
							.attr('y', function(d) { return _this.getDimensions().height; })							
							.attr('height', 0)
							.on("mouseover", mouseover)
							.on("mouseout", mouseout)
							.transition()
								.duration(300)
									.attr('y', function(d) { return _this.y(d.doc_count); })
									.attr('height', function (d) { return _this.getDimensions().height - _this.y(d.doc_count); });
						

					//update
					bars.attr('x', function (d, i) { return _this.x(d.key_as_string); })						
						.attr('y', function(d) { return _this.getDimensions().height; })
						.attr('width', this.x.bandwidth())
						.attr('height', 0)
						.classed('selected', true)
						.merge(bars)
						.on("mouseover", mouseover)
						.on("mouseout", mouseout)
							.transition()
								.duration(300)
									.attr('y', function(d) { return _this.y(d.doc_count); })
									.attr('height', function (d) { return _this.getDimensions().height - _this.y(d.doc_count); });

					//exit
					bars.exit()
						.transition().duration(300)						
						.attr('y', _this.getDimensions().height)
						.attr('height', 0)
						.style('opacity', 0)
						.remove();
					
						
					d3.select(this.container + ' svg')
						.attr('width', dimensions.svgWidth)				
					

					d3.select(this.container + ' svg .bars .axis--x') 
						.attr('transform', 'translate(0,' + dimensions.height + ')')
						.call(this.xAxis)
							.selectAll('text')
							.attr("dy", tickTextPosition); //move ticktext down
						
					
					this.svgg.selectAll(".axis--x .tick line").attr('y2', tickLineLengthFirstLast); //change length of first and last axis line
					
					
					//no data to display
					if(_this.data.length == 0) {
						this.svg.append('g')
							.attr('class', 'empty')
							.style('opacity', 0);
							
						this.svg.select('.empty').append('line')
								.attr('x1', _this.getDimensions().width/4)
								.attr('x2', _this.getDimensions().width/2 + _this.getDimensions().width/4)
								.attr('y1', _this.getDimensions().height/2 - 30 + _this.getDimensions().margin.top)						
								.attr('y2', _this.getDimensions().height/2 - 30 + _this.getDimensions().margin.top)
								.style('stroke-width', 1)
								.style('stroke', '#ccc');
								
						this.svg.select('.empty').append('line')
								.attr('x1', _this.getDimensions().width/4)
								.attr('x2', _this.getDimensions().width/2 + _this.getDimensions().width/4)
								.attr('y1', _this.getDimensions().height/2 + 30 + _this.getDimensions().margin.top)							
								.attr('y2', _this.getDimensions().height/2 + 30 + _this.getDimensions().margin.top)
								.style('stroke-width', 1)
								.style('stroke', '#ccc');
								
						this.svg.select('.empty').append('text')
									.attr('font-family', 'sans-serif')
									.attr('text-anchor', 'middle')
									.attr('x', _this.getDimensions().width/2)
									.attr('y', 8 +_this.getDimensions().height/2 + _this.getDimensions().margin.top)
									.style("font-size", 14)
									.text('NO DATA TO DISPLAY');
									
						this.svg.select('.empty').transition().duration(500).style('opacity', 1);
						
						
						
						
						
						/* Remove HANDLES if updated with []*/
						this.slider.removeSliderControlls();
						
						
						
					}
					
					
				},

				resize: function() {
					this.updateGraph();
					this.updateSlider();					
				},
				
				initOnWindowResize: function() {
					$(window).resize(function(){       
						if(DateRange.graph.getDataSize() != 0) DateRange.graph.resize();
					});
				}
				
			}
			
		};
			

		// The actual plugin constructor
		function Plugin ( element, options ) {
			var _self = this;
						
			this.element = element;
			//this.options = options;

			// jQuery has an extend method which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.settings = $.extend( {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;

						
			//public method
			this.update = function(data) {
				//this references the div not the plugin object
				//_self = this object
				
				_self.settings.data = data;				
				_self.drawAndUpdate();
			}

			DateRange.updateSelectedRange = function() {				
							
				if (typeof _self.settings.onRangeUpdate === "function") {
					_self.settings.onRangeUpdate(DateRange.getRange());
				}
				
			}

			if (typeof _self.settings.hoverText === "function") {
				DateRange.hoverText = function() {
					var currentBar = DateRange.getCurrentBarData();					
					return _self.settings.hoverText(currentBar);
				}
				
			}			
		
			this.init();
			
		}

		// Avoid Plugin.prototype conflicts
		$.extend( Plugin.prototype, {

			init: function() {

				//Place initialization logic here
				//You already have access to the DOM element and
				//the options via the instance, e.g. this.element
				//and this.settings
				//you can add more functions like the one below and
				//call them like the example below
				//this.yourOtherFunction( this.settings.propertyName );				
				
				
				DateRange.graph.setData(this.settings.data);
				
				//update settings of graph
				DateRange.updateGraphSettings(this.settings);
				
				DateRange.graph.drawGraph();
				
				DateRange.graph.drawSlider();
				
				//update ui on init
				DateRange.updateSelectedRange(); //will call the overridden function
								
			},
						
			drawAndUpdate: function() {
				var currentDataSize = DateRange.graph.getDataSize();				
				var updatedDataSize = 0;
				
				DateRange.graph.setData(this.settings.data); //update data
				updatedDataSize = DateRange.graph.getDataSize();
				
				DateRange.clearRange();
				DateRange.graph.updateGraph();
								

				//draw slider only if there is new data
				if(updatedDataSize != 0) {
					DateRange.graph.drawSlider(); //write new					
				}
				DateRange.updateSelectedRange(); //initial selected range
				
			}			
			
		} );

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function( options ) {	
			
			if (typeof arguments[0] === 'string') {
				var methodName = arguments[0];
				var args = Array.prototype.slice.call(arguments, 1);
				var returnVal;
				this.each(function() {
					if ($.data(this, 'plugin_' + pluginName) && typeof $.data(this, 'plugin_' + pluginName)[methodName] === 'function') {
						returnVal = $.data(this, 'plugin_' + pluginName)[methodName].apply(this, args);
					// Allow instances to be destroyed via the 'destroy' method
					//https://github.com/jquery-boilerplate/jquery-boilerplate/wiki/Extending-jQuery-Boilerplate
					} else if (methodName === 'destroy') {
							$.data(this, 'plugin_' + pluginName, null);
						} else {
							throw new Error('Method ' +  methodName + ' does not exist on jQuery.' + pluginName);
						}
				});
				if (returnVal !== undefined){
					return returnVal;
				} else {
					return this;
				}
			} else if (typeof options === "object" || !options) {
				return this.each(function() {
					if (!$.data(this, 'plugin_' + pluginName)) {
					$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
					}
				});
			}

			
		};
		

} )( jQuery, window, document, d3 );