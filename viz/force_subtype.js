
var w = 1380,
    h = 1300,
    padding = 40,
    fill = d3.scale.category20();

/**
var nodeinfo = d3.select("#nodetooltip")
  .append("p")
  .style("font-size", "20px")
  .text("Mouseover on node to see node properties!");

var edgeinfo = d3.select("#edgetooltip")
  .append("p")
  .style("font-size", "20px")
  .text("Mouseover on edge to see edge properties!")
**/

var vis = d3.select("#chart")
  .append("svg")
    .attr("width", w)
    .attr("height", h);

var nodeinfo = vis.append("text")
    .text("Mouseover on node to see node properties!")
    .attr("font-size", '20px')
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + w / 2 + ", " + padding + ")")
    .attr("align", "center")

var edgeinfo = vis.append("text")
    .text("Mouseover on edge to see edge properties!")
    .attr("font-size", '20px')
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + w / 2 + ", " + padding * 2 + ")")
    .attr("align", "center")

var fisheye = d3.fisheye.circular()
                          .radius(200)
                          .distortion(2);

// Load data and begin binding to DOM elements
d3.json("force2.json", function(json) {

  console.log(json)

  //Create array of dates for the x-axis
  var dates = new Array()
  dates = json.nodes.map(function(d) {
    return Date.parse(d.isolation_date)
  });
  
  // Create x-axis scale
  var xScale = d3.time.scale()
                  .domain(d3.extent(dates))
                  .range([padding, w - padding]);

  // Create x-axis
  var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom");

  // Append x-axis to the chart display
  vis.append("g")
        .attr("class", "axis") //assign "axis" class
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis)

  // Function for setting edge (a.k.a. link) colors by transmission type
  function linkcolortype(d) {
    var scale = d3.scale.category10()
        .domain(['Intra-Species', 'Inter-Species'])
    return scale(d.trtype)
  }

/**
  // Function for setting edge colors by time class
  function linkcolortime(d) {

    var scale = d3.scale.category10()
                          .domain(['direct', 'environmental', 'reassortant'])
    return scale(d.time_class)
  } **/

/**
  // Function for setting node colors by age year
  function nodecolorage(d) {
    var scale = d3.scale.category10()
          .domain(['HY', 'AHY'])
    return scale(d.age_simple)
  } **/

/**
  // Remove this encoding for production
  function nodecolorage_hardcoded(d) {
    if ( d.age == 'HY' ) {
      return 'red'
    }

    if ( d.age == 'AHY' ) {
      return 'blue'
    }

    if ( d.age == '2C' ) {
      return 'red'
    }

    if ( d.age == '2B' ) {
      return 'red'
    }

    if ( d.age == '2A' ) {
      return 'red' 
    }

    if ( d.age == '1B' ) {
      return 'red'
    }

    if ( d.age == '1C' ) {
      return 'red'
    }

    if ( d.age == '3' ) {
      return 'red'
    }
  } **/
  
  function gethosts(d) {
    var hosts = []
        max = json.nodes.length - 1

    for (var n = 0; n <= max; n++) {
      if ( hosts.indexOf(json.nodes[n].host) == -1 ) {
        hosts.push(json.nodes[n].host)
      }
    }

  console.log(hosts)
  return hosts
  }

  species = gethosts(json)
  //console.log(species)
  /** Function for setting node colors by host species **/
  function nodecolorspecies(d) {
    var scale = d3.scale.category20()
        .domain(species)
    //console.log(scale(d))
    return scale(d.host)
  }

  /** Function for getting states**/
  function getstates(d) {
    var states = []
        max = json.nodes.length - 1

    for (var n = 0; n <= max; n++) {
      if ( states.indexOf(json.nodes[n].state) == -1) {
        states.push(json.nodes[n].state)
      }
    }
    console.log(states)
    return states
  }

  states = getstates(json)
  /** Function for setting node colors by state **/
  function nodecolorstates(d) {
    var scale = d3.scale.category20()
        .domain(states)

    return scale(d.state)
  }



  // Code to get list of subtypes represented
  function getsubtypes(json) {
    var subtypes = []
        max = json.nodes.length - 1

    for (var n = 0; n <= max; n++){
        if ( subtypes.indexOf(json.nodes[n].subtype) == -1 ) {
          subtypes.push(json.nodes[n].subtype)

        }
    }
  console.log(subtypes)
  return subtypes
  }

  // Function for setting node colors by subtype
  subtypes = getsubtypes(json)
  console.log(subtypes)
  function nodecolorsubtype(d) {

    var scale = d3.scale.category10()
        .domain(subtypes);

    return scale(d.subtype);
  }

  // Create force layout
  var force = d3.layout.force()
      .charge(-50)
      .linkDistance(30)
      .nodes(json.nodes)
      .links(json.links)
      .size([w, h])
      .start();

  // Create opacity scale
  var opScale = d3.scale.linear()
    .domain([0.7, 1])
    .range([0.2, 0.5])

  // Declare the radius slider object. Apply methods later.
  // var radiusslider = d3.select('#nodeslider').call(d3.slider());

  // Bind data to links
  var link = vis.selectAll("line.link")
      .data(json.links)
      .enter().append("svg:line")
      .style("stroke", linkcolortype)
      .attr("class", "link")
      .style("stroke-width", 2) /**{ 
        var lowEnd = 1;
        var highEnd = 8;
        var segments = [];
          while(lowEnd <= highEnd){
             segments.push(lowEnd++);
          }

          if(segments.indexOf(d.segment) > -1){
            return d.weight * 2 / 3; 
          }
          if(segments.indexOf(d.segment) == -1) {
            return d.weight * 2 / 3;
          } 
      })**/
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .style("marker-end", "url(#Triangle)")
      .style("stroke-opacity", function(d) { return opScale(d.weight) });
  

  // Bind data to nodes
  var node = vis.selectAll("circle.node")
      .data(json.nodes)
    .enter().append("svg:circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", 7)
      .style("fill", nodecolorsubtype)
      .style("opacity", '1.0')
      .call(force.drag);

  // Append an "svg title" to each node
  node.append("svg:title")
      .text(function(d) { return d.label; });
      
  vis.selectAll("circle.node")
      .append("svg:title")
      .text(function(d){
        return d.label;
      })

  

  /**radiusslider.on("slide", function(event, value){
        node.attr("r", value);
      })**/
  
  // Interactive actions for each node
  node.on("mouseover", function(d) {
            d3.select(this).style("opacity", "1");

            nodeinfo.text(d.id + " | " + d.isolation_date + " | " + d.host + ' | ' + d.subtype);         
          })
      .on("mouseout", function() {
            d3.select(this).style("opacity", "1");

            nodeinfo.text("Mouseover on node to see node properties!")
          })

  // Interactive actions for each link
  link.on("mouseover", function(d) {
          d3.select(this).style('stroke-opacity', '1');

          edgeinfo.text(d.weight + " | " + d.trtype)
        })
        .on('mouseout', function() {
          d3.select(this).style('stroke-opacity', function(d) { return opScale(d.weight) } );

          edgeinfo.text("Mouseover on edge to see edge properties!")
        })

  // Transition parameters for the visualization
  vis.style("opacity", 1e-6)
    .transition()
      .duration(1000)
      .style("opacity", 1);
  
  // Recompute actions each tick
  force.on("tick", function() {
    
    node.each(function(d){
      var xpos = xScale(Date.parse(d.isolation_date));
      d.x = xpos// d.px = Math.min(xpos + 10, Math.max(xpos - 10, d.x))
     // console.log(xpos)
    })

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
  });



});

