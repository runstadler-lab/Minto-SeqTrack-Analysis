var width = 960,
    height = 960,
    innerRadius = 40,
    outerRadius = 440;

d3.json('force2.json', function(json) {

    var nodes = json.nodes

    var links = json.links
    
    dates = json.nodes.map(function(d){ return Date.parse(d.isolation_date) } )
    dates = jQuery.unique(dates).sort()
    l = dates.length
    var radius = d3.time.scale().domain([dates[0], dates[l-1]]).range([innerRadius, outerRadius])

    subtypes = json.nodes.map(function(d) { return d.subtype } )
    subtypes = jQuery.unique(subtypes)
    var color = d3.scale.category20().domain(subtypes)

    hosts = json.nodes.map(function(d) { return d.host } )
    hosts = jQuery.unique(hosts)
    var angle = d3.scale.ordinal().domain(hosts).rangePoints([0, 2 * Math.PI]);
    n = hosts.length

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    axis = svg.selectAll(".axis")
        .data(hosts)
      .enter().append("line")
        .attr("class", "axis")
        .attr("x1", radius.range()[0])
        .attr("x2", radius.range()[1])
        .attr("transform", function(d) { return "rotate(" + degrees(angle(d)) + ")"; });

    node = svg.selectAll(".node")
              .data(nodes)
            .enter().append("circle")
              .attr("class", "node")
              .attr("cx", function(d) { return radius( Date.parse( d.isolation_date ) ) })
              .attr("transform", function(d) { return "rotate(" + degrees( angle( d.host ) ) + ")"; })
              .attr("r", 7)
              .style("fill", function(d) { return color( d.subtype ); });

    link = svg.selectAll(".link")
              .data(links)
              .enter()
              .append("path")
              .attr("d", d3.hive.link()
                .angle(function(k) { return angle( k.host ); })
                .radius(function(k) { return radius( k.isolation_date ); }))

    console.log(link)

    link.style("stroke", function(d) { return 'black' });


  })

function degrees(radians) {
  return radians / Math.PI * 180 - 90;
}
