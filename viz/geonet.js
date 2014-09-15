var width = 600
var height = 600
var padding = height / 10

// Create a new chart in which to display the geonet
var chart = d3.select("#chart")
	.append("svg")
	.attr("width", width)
	.attr("height", height)


// Create an "info bar" at the top
var infobar = chart.append("text")
		.attr("font-size", "20px")
		.attr("text_anchor", "middle")
		.attr("transform", "translate(" + width / 2 + "," + padding / 2 + ")")
		.attr("align", "center")

// Load data and begin binding to DOM elements.

d3.json("geonet.json", function(json) {

	console.log(json)

	//***** Function for scaling edge opacity. *****//
	// Step 1: Figure out what the max weight is.
	function get_max_weight(data){
		var maxweight = 0
		var maxnum = json.links.length - 1

		for (var n = 0; n <= maxnum; n++) {
			if (json.links[n].weight > maxweight) {
				maxweight = json.links[n].weight
			}
		}

		return maxweight
	}
	maxweight = get_max_weight(json)

	// Step 2: Create linear scale for opacity.
	var opacity_scale = d3.scale.linear()
								.domain([0, maxweight])
								.range([0.2, 1])

	//***** End function for scaling edge opacity. *****//

	//***** Function for positioning nodes *****//
	// Step 1: Figure out what min and max N are:
	function get_Ns(data){
		Ns = []
		maxnum = json.nodes.length - 1

		for (var n = 0; n <= maxnum; n++) {
			if (Ns.indexOf(json.nodes[n].N) == -1) {
				Ns.push(json.nodes[n].N)
			}
		}

		return Ns
	}

	maxN = Math.max.apply(null, get_Ns(json))
	minN = Math.min.apply(null, get_Ns(json))

	// Step 2: Figure out what min and max W are:
	function get_Ws(data){
		Ws = []
		maxnum = json.nodes.length - 1

		for (var n = 0; n <= maxnum; n++) {
			if (Ws.indexOf(json.nodes[n].W) == -1) {
				Ws.push(json.nodes[n].W)
			}
		}

		return Ws
	}

	maxW = Math.max.apply(null, get_Ws(json))
	minW = Math.min.apply(null, get_Ws(json))

	// Step 3: Create scales for N and W
	scaleN = d3.scale.linear()
					.domain([minN, maxN])
					.range([height - padding, 0 + padding])
	scaleW = d3.scale.linear()
					.domain([minW, maxW])
					.range([width - padding, 0 + padding])

	// Create Force-directed layout.

	var force = d3.layout.force()
			.charge(-100)
			.linkDistance(200)
			.nodes(json.nodes)
			.links(json.links)
			.size([width, height])
			.start();

	// Bind data to links
	var link = chart.selectAll("line.link")
			.data(json.links)
			.enter().append("path")
			.style("fill", "none")
			.style("stroke", "black")
			.attr("class", "link")
			.style("stroke-width", 3)
			.style("stroke-opacity", function(d) { return opacity_scale(d.weight)})
			.attr("x1", function(d) { return d.source.x })
			.attr("y1", function(d) { return d.source.y })
			.attr("x2", function(d) { return d.target.x })
			.attr("y2", function(d) { return d.target.y });

	// Bind data to nodes
	var node = chart.selectAll("circle.node")
			.data(json.nodes)
			.enter()

			// Append the drawing of the circle
			.append("svg:circle")
			.attr("class", "node")
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
			.attr("r", 7)
			.style("fill", "black")
			.style("opacity", 0.5)
			.call(force.drag)
			

	// Append the title as a tooltip
	node.append("svg:title")
		.text( function(d) { return d.id })

	// Interactive actions for each node
	// Mouseover action on node - enlarge and color red
	node.on("mouseover", highlight(0.1, "red"))

	// Mouseout action on node.
	node.on("mouseout", dehighlight())

	// Mouseover action on link - make it stroke width 5 in red.
	link.on("mouseover", function(d) {
			d3.select(this)
					.transition()
					.duration(500)
					.style("stroke", "red")
					.style("stroke-opacity", 1.0)
					.style("stroke-width", 5.0)
					.ease("elastic")
			infobar.text(d.source.id + "-" + d.target.id)
		})

	// Mouseout action on link - return to original stroke-width in black
	link.on("mouseout", function() {
			d3.select(this)
					.transition()
					.duration(500)
					.style("stroke", "black")
					.style("stroke-opacity", function(d) { return opacity_scale(d.weight)})
					.style("stroke-width", 3.0)
					.ease("elastic")
			infobar.text("");
		})
			

	force.on("tick", tick)

	// Use elliptical arc path segments to doubly-encode directionality.
	function tick() {
		node.each(function(d) {
			d.x = scaleW(d.W)
			d.y = scaleN(d.N)
		})

		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });

		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; })
			.attr("d", linkArc);
	}

	// This function creates an arc'd link rather than a straight-line link,
	// so as to highlight the bi-directionality inside a graph (if any is present)
	function linkArc(d) {
		var dx = d.target.x - d.source.x,
		dy = d.target.y - d.source.y,
		dr = Math.sqrt(dx * dx + dy * dy);

		return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
	}

	// 
	var linkedByIndex = {};
		json.links.forEach(function(d) {
			linkedByIndex[d.source.index + "," + d.target.index] = 1;
	});

	function isConnected(a, b) {
		return linkedByIndex[a.index + "," + b.index] || a.index == b.index;
	}

	function highlight(opacity, color) {
		// Set the opacity of non-connected stuff to "opacity"
		return function(d) {
			var connected = [d]

			node.each(function(o) {
				if (isConnected(d, o)) {
					connected.push(o)
				}
			})

		node.style("opacity", function(o) {
				thisOpacity = opacity;
				connected.forEach( function(e) {
					if (isConnected(e, o)) {
						thisOpacity = 1;
					}
				})

				return thisOpacity
		})

		link.style("stroke-opacity", function(o) {
				thisOpacity = opacity;
				connected.forEach(function(e) {
					if(o.source == e) { //o.target == e ||
						thisOpacity = 1;
					}
				})
				return thisOpacity
		})
			.style("stroke", function(o) {
				thisColor = "black";
				connected.forEach(function(e) {
					if(o.source == e) { //o.target == e || 
						thisColor = color;
					}
				})
				return thisColor;
			})

		d3.select(this)
			.transition()
			.duration(500)
			.attr("r", 14)
			.style("fill", "red")
			.style("opacity", "1")
			.ease("elastic");
		infobar.text(d.id);
		}
	}

	function dehighlight() {
		return function() {
			node.style("opacity", 0.5)
			link.style("stroke-opacity", function(d) { return opacity_scale(d.weight) })
			link.style("stroke", "black")

		 	d3.select(this)
				.transition()
				.duration(500)
		 		.attr("r", 7)
		 		.style("opacity", "0.5")
		 		.style("fill", "black")
		 		.ease("elastic")
			 infobar.text("");

		}
	}
})