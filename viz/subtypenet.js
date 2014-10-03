var width = 1200,
    height = 1200;

var color = d3.scale.category10();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(100)
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("subtypenet.json", function(error, graph) {
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

  var link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", 1)
      .style("stroke", function(d) { return color(d.segment)});

  link.append("title")
      .text(function(d) { return "segment " + d.segment })

  var node = svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", "blue")
      .call(force.drag);

  node.append("title")
      .text(function(d) { return d.id; });

  node.on("mouseover", function(d) {
    d3.select(this)
        .transition()
        .duration(500)
        .style("r", 10)
        .ease("elastic")

  })

  node.on("mouseout", function(d) {
    d3.select(this)
        .transition()
        .duration(500)
        .style("r", 5)
        .ease("elastic")
  })

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
});
