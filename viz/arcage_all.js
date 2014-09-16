/** Define visualization canvas parameters **/
var width = 1200
var height = 1200
var padding = height / 20

var plot = d3.select("#chart")
				.append("svg")
				.attr("width", width)
				.attr("height", height)

/** Create an "info bar" at the top **/
var infobar = plot.append("text")
					.attr("font-size", "20px")
					.attr("text_anchor", "middle")
					.attr("transform", "translate(" + width / 2 + "," + padding / 2 + ")")
					.attr("align", "center")
					.text("Minto Flats Transmissions Categorized by Age")

/** Load data and begin binding to DOM elements. **/
d3.json("arcage_all.json", function(error, data) {

	if(error) return console.warn(error); 

	/** Create array of dates **/
	var dates = new Array()
	dates = data.nodes.map(function(d) {
		return Date.parse(d.isolation_date)
	})

	/** Create x-axis Scale **/
	var xScale = d3.time.scale()
						.domain(d3.extent(dates))
						.range([padding, width - padding])

	/** Draw x-axis **/
	var xAxis = d3.svg.axis()
						.scale(xScale)
						.orient("bottom")

	/** Append x-axis to chart display **/
	plot.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (height - padding) + ")")
			.call(xAxis)

	/** Function to get the different types of links present **/
	function getLinkTypes(data) {
		var linkTypes = []
		var max = data.links.length - 1

		for (var n = 0; n <= max; n++) {
			// console.log(data.links[n].tr_age)
			if (linkTypes.indexOf(data.links[n].tr_age) == -1) {
				linkTypes.push(data.links[n].tr_age)
			}
		}
		return linkTypes
	}
	
	linkTypes = getLinkTypes(data)
	console.log(linkTypes)

	/** Bind data to nodes **/
	var node = plot.selectAll("circle.node")
					.data(data.nodes)
				.enter().append("svg:circle")
					.attr("class", "node")
					.attr("cx", function(d) { return xScale(Date.parse(d.isolation_date)) })
					.attr("cy", function(d) { return height - 10 * padding} )
					.attr("r", 5)
					.style("fill", "black")
					.style("opacity", 1)


	/** Bind data to links **/
	var link = plot.selectAll("line.link")
					.data(data.links)
				.enter().append("path")
					.style("fill", "none")
					.style("stroke", function(d) { return linkColorType(d) })
					.attr("stroke-width", 1)
					.attr("stroke-opacity", 0.5)
					.attr("stroke-dasharray", function(d) { return linkStrokeType(d) })
					.attr("x1", function(d) { return getNodeX(d.source) })
					.attr("y1", function(d) { return height - 10 * padding })
					.attr("x2", function(d) { return getNodeX(d.target) })
					.attr("y2", function(d) { return height - 10 * padding })
					.attr("d", function(d) {
								var x1 = getNodeX(d.source)
								var x2 = getNodeX(d.target)
								var y = height - 10 * padding

								var radius = (Math.max(x1, x2) - Math.min(x1, x2)) / 2

								return "M" + x1 + "," + y + " A " + radius + "," + radius + " 0 0 1 " + x2 + "," + y

					})

	link.append("svg:title")
		.text(function(d) { return getNodeAge(d.source) + "-" + getNodeAge(d.target)})

	link.on("mouseover", function(d) {
		d3.select(this)
			.transition()
			.duration(500)
			.style("stroke-width", 10)
			.ease("elastic")

		infobar.text(getNodeAge(d.source) + "-" + getNodeAge(d.target))
	})

	link.on("mouseout", function(d) {
		d3.select(this)
			.transition()
			.duration(500)
			.style("stroke-width", 1)
			.ease("elastic")
		infobar.text("Minto Flats Transmissions Categorized by Age")
	})

	/** Function to get a node's state **/
	function getNodeState(node) {
		return data.nodes[node].state
	}

	function linkStrokeType(d) {
		if ((getNodeState(d.source) == "Interior Alaska") && (getNodeState(d.target) != "Interior Alaska")) {
			return "5,5"
		}

		else {
			return "none"
		}
	}


	/** Function to get a node's x-value **/
	function getNodeX(node){
		return xScale(Date.parse(data.nodes[node].isolation_date))
	}

	/** Function to get a node's name **/
	function getNodeAge(node) {
		return data.nodes[node].age
	}

	/** Function to set color by link type **/
	function linkColorType(d) {
		scale = d3.scale.category10()
								.domain(linkTypes)
		console.log(scale(d.tr_age))
		return scale(d.tr_age)
	}



})

