// ===========================Variabls=======================
// customizerable variables
var labelColor = {
	0: 'black', //default color
	1: 'blue',
	2: 'green',
	3: 'pink',
	4: 'yellow'
};
const svgResolution = {
	"width": 560,
	"height": 560,
};
const pointSize = 3;

// non-customizable variables
var dataset = [];
var circleAttr = null;
var circle = null;
var currentLabel = 0;
var shadeSize = 30;
var isclick = false;

// ======================svg container config===================
// svg container
const svgContainer = d3.select('#main').append('svg')
					.attr('width', svgResolution['width'])
					.attr('height', svgResolution['height'])
					.attr('class', 'svg-container')
					.on('click', function(){
						var x = d3.mouse(this)[0];
						var y = d3.mouse(this)[1];
						dataset.push([x,y, currentLabel]);
						updatePoints(dataset);
					});

// the shade object works like a brush
// within the shade, there will generate random points
var shade = svgContainer.append('circle').attr('id', 'shade');

var dropdown = d3.select('#funcs').append('select').attr('id', 'labels');
dropdown.selectAll('option')
	.data(d3.entries(labelColor))
	.enter()
	.append('option')
	.attr('value', val => val.key)
	.text(val => 'class-'+val.key);

// axis 
var x_scale = d3.scaleLinear()
			.domain([0, 1])
			.range([0,svgResolution['width']]);

var y_scale = d3.scaleLinear()
			.domain([0, 1])
			.range([svgResolution['height'], 0]);

var x_axis = d3.axisBottom()
			.scale(x_scale);

var y_axis = d3.axisLeft()
			.scale(y_scale);
var xAxisTranslate = svgResolution['height'] - 30;
svgContainer.append('g')
			.attr("transform", "translate(30, " + xAxisTranslate  +")")
			.call(x_axis);

svgContainer.append("g")
   .attr("transform", "translate(30, -30)")
   .call(y_axis);



// ====================event listener===================
// adding event listener for chaning another label

svgContainer.on('mousemove', function(){
	// shade area will be used to restrict
	// generate random points
	shade.attr('cx', d3.mouse(this)[0])
	.attr('cy', d3.mouse(this)[1])
	.attr('r', shadeSize)
	.style('fill', 'lightgrey');

	// if user press and move cursor
	if(isclick){
		var x = d3.mouse(this)[0] + getRandomInt(-shadeSize, shadeSize);
		var y = d3.mouse(this)[1] + getRandomInt(-shadeSize, shadeSize);
		dataset.push([x,y, currentLabel]);
		updatePoints(dataset);
	}
}).on('mousedown', function(){
	// when mouse pressed, start generate random points
	isclick = !isclick;
}).on('mouseup', function(){
	// when mouse up, stop generate random points
	isclick = !isclick;
});

// change labels (grand trueth) accordingly
d3.select('#labels').on('change', function(){
		currentLabel = this.value;
});

// change shadeSize accordingly
d3.select('#shadeSize').on('change', function(){
	shadeSize = this.value;
});

d3.select('#download').on('click', function(){
	// don't allow download when no points drawed
	if(dataset.length == 0){
		alert("must draw points to download");
	}else{
		let csvContent = "data:text/csv;charset=utf-8,"+
		normalization(dataset).map(e=>e.join(",")).join("\n");
		var encodedUri = encodeURI(csvContent);
		var link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "my_data.csv");
		document.body.appendChild(link);
		link.click();
	}
});

d3.select('#clear').on('click', function(){
	// clear dataset
	dataset.length = 0;
	// clear points on svg
	svgContainer.selectAll('circle.point').remove();
});

// ======================customize functions===============
// data transformation, which implies change origin
// because, the default origin is top left
// which we want to transform to bottom left
function transformData(dataset){
	return dataset.map(tuple => [tuple[0], svgResolution['height']-tuple[1], tuple[2]]);
}

// normalize data into range(0,1)
function normalization(dataset){
	// the core normalization function
	function norm(d, min, max){
		return ((d-min)/(max-min)).toFixed(2);
	}

	dataset = transformData(dataset);
	var norm_data = dataset.map(val => [norm(val[0], 0, svgResolution['width']),
								norm(val[1], 0, svgResolution['height']), val[2]]);
	return norm_data;
}

// generate random value between range(min, max)
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// the main logic to draw points on svg canvas
function updatePoints(dataset){
	circle = svgContainer.selectAll('circle')
								.data(dataset)
								.enter()
								.append('circle');

	circleAttr = circle.attr('cx', function(d){return d[0]})
	.attr('class', 'point')
	.attr('cy', function(d){return d[1]})
	.attr('r', function(){return pointSize;});
	circleAttr.style('fill', labelColor[currentLabel]);
}