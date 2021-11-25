# daterange-ui.js
Animated responsive daterange UI component - jQuery plugin<br>
jQuery Plugin for visualizing datasets of dates and selecting a unique range<br>
build upon D3.js


![preview](https://github.com/jpweinerdev/daterange-ui.js/blob/main/intro.png)


## jQuery initialization and customization
This plugin requires jQuery (&gt;= 1.8.x) and D3.js (&gt;= v5.4.0)<br>Font Awesome (4.4.x) is used for the handles inner icon symbols.

## Minimal html configuration
```html
<div id="graph"></div>
```

## Custom CSS settings
```
#graph text { fill: #ccc; }

#graph tik { fill: #ccc; }

#graph .domain, #graph line { stroke: #ccc; }

#graph .bars .bar { fill: #bdb7b7; }

#graph .bars .bar.highlight { fill: #d81b60 !important; }

#graph .bars .axis--x path { display: none; }

#graph .bars .bar.selected { fill: #fff; }

#graph .handles .selector { fill: #fff; stroke: #777; stroke-width: 0.5px; }

#graph .handles .selector.active { fill: #ccc !important; }

#graph .handles .range { fill: #fff; stroke: none; }

#graph .handles .selector .handlehovertext { fill: #fff; stroke: none; font-size: 11px; font-family: Helvetica, Arial; }

#graph div.tooltip { position: absolute; text-align: center; width: 40px; height: 24px; padding-top: 5px; font: 12px sans-serif; background: #ccc; border: 0px; border-radius: 2px; pointer-events: none; color: #333; }

#graph div.tooltip:after { box-sizing: border-box; display: inline; width: 100%; line-height: 1; color: #ccc; content: "\25BC"; position: absolute; text-align: center; margin: -3px 0 0 0; top: 100%; left: 0; }
```

## jQuery initialization and customization
This plugin requires jQuery (>= 1.8.x) and D3.js (&gt;= v5.4.0)

```javascript
$("#graph").daterangeselect({
	data: [],
	height: 320,
	rangeBarOpacity: 0.4,
	handleScaleFactor: 1.6,
	dataLengthTrigger: 30,
	onRangeUpdate: function (obj) {	
		$('#range').html('Range: '+ obj[0] + ' – '+ obj[1]);
	},
	hoverText: function (obj) {
		return obj.key_as_string;
	}
});
```

## Options and parameters
Parameter | Type | Default | Description
--- | --- | --- | ---
`container` | string | #graph | ID or class of HTML container element (div)
`height` | int | 320 | total height of SVG container
`rangeBarOpacity` | float | 0.4 | opacity of range bar indicator (> 0, <= 1)
`handleScaleFactor` | float | 1.6 |	scale factor of slider handles (>= 1, <= 1.7)
`dataLengthTrigger` | int | 30 | show tick values on x-axis for each bar or every 10th element<br>data lengt =< value: show on each bar<br>data lengt > value: show on every 10th element
`data` | array | [] | data array: [{"key_as_string": "2003", doc_count: 123, "key": 1041375600000}]<br>object properties:<br>"key_as_string" (string): Year<br>"doc_count" (int): value<br>"key" (int): unix timestamp in milliseconds

## Events
Parameter | Description
--- | ---
`onRangeUpdate` | call back function for slider range selection event<br>returns Array<br>[<br>    0: from,<br>    1: to<br>]<br>[0: 1987, 1: 2002] 
`hoverText` | call back function for custom hoover text format<br>expects string as return value (can be in html format)<br>object keys:<br>"key_as_string" (string): Year<br>"doc_count" (int): value<br>"key" (int): unix timestamp in milliseconds

## Methods
Parameter | Description
--- | ---
`update` | update graph<br>method name "update"<br>expects second parameter "data"<br>var data = [];<br>$("#indicator").stackbars("update", data);



## Demo

See working demo on [developer.jpweiner.net](http://developer.jpweiner.net/daterange.html).


## Credits

Built on top of [jQuery Boilerplate](http://jqueryboilerplate.com).

## License

[MIT License](http://zenorocha.mit-license.org/) © Zeno Rocha
