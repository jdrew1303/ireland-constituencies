function main() {
    var width = 478,
      height = 500,
      active;

    var dub_counties = [10,11,12,13,14,15,16,17,18,19,20];

    var projection = d3.geoAlbers().center([-3, 53.40]).rotate([4.4, 0]).parallels([50, 60]).scale(1500 * 4.5).translate([width / 2, height / 2]);
    var path = d3.geoPath().projection(projection);
    var projection_dub = d3.geoAlbers().center([-2.7, 53.40]).rotate([4.4, 0]).parallels([50, 60]).scale(1600 * 12).translate([width / 2, height / 2]);
    var path_dub = d3.geoPath().projection(projection_dub);
    var svg = d3.select("#map").append("svg").attr("width", width).attr("height", height); //.call(responsivefy);
    svg.append("rect").attr("width", width).attr("height", height)//.on("click", zoomOut);
    var g = svg.append("g").attr("class", "ireland");
    var g_dub = svg.append("g").attr("class", "dublin");

    d3.json("/ireland.topo.json", function(error, ireland) {
        if (error) throw error;

        console.log(ireland);

        g.selectAll(".subunit")
          .data(topojson.feature(ireland, ireland.objects.census2011_constituencies_2013).features)
        .enter().append("path")
          .attr("class", function(d) {
              var xml_id = "";
              if (d.properties.results_id <10 && d.properties.results_id[0]!="0") xml_id = "0" + d.properties.results_id;
              else xml_id = d.properties.results_id;
              xml_id = "C" + xml_id;
              return  "subunit " + xml_id;
          })
          .attr("id",  function(d) { return  d.properties.slug;})
          .attr("d", path)
          //.on("click", function (d) { if (d.properties.slug != '') window.location.href = '/news/election-2016/constituencies/' + d.properties.slug + '/' })
          .on("mouseover", function (d) { showPopover.call(this, d); })
          .on("mouseout", function (d) { removePopovers(); })

        g_dub.selectAll(".subunit")
          .data(topojson.feature(ireland, ireland.objects.census2011_constituencies_2013).features)
        .enter().append("path")
          .attr("class", function(d) {
              var xml_id = "";
              if (d.properties.results_id <10 && d.properties.results_id[0]!="0") xml_id = "0" + d.properties.results_id;
              else xml_id = d.properties.results_id;
              xml_id = "C" + xml_id;
              return  "subunit " + xml_id;
          })
          .filter(function(d){ //return d >= 5;
                return (dub_counties.indexOf(d.properties.results_id) != -1);
          })
          .attr("id",  function(d) { return  d.properties.slug;})
          .attr("d", path_dub)
          //.on("click", function (d) { if (d.properties.slug != '') window.location.href = '/news/election-2016/constituencies/' + d.properties.slug + '/' })
          .on("mouseover", function (d) { showPopover.call(this, d); })
          .on("mouseout", function (d) { removePopovers(); })

          function loadCounty(slug) {
              topojson.feature(ireland, ireland.objects.census2011_constituencies_2013).features.forEach(function (d) {
                  if (slug === d.properties.slug) {
                      zoomIn(d,0.3,1000,500);
                  };
              })
          }

      });
};

function removePopovers() {
    $('.popover').each(function() {
        $(this).remove();
    });
}
function showPopover(d) {
    $(this).popover({
        placement: 'auto top',
        container: 'body',
        trigger: 'manual',
        html: true,
        content: function() {
            var message = d.properties.name;
            message += " C"+d.properties.results_id;
            return message;
        }
    });
    $(this).popover('show')
}
function zoomIn(d, scale, speed, delay) {
    if (active === d)
        return reset();
    g.selectAll(".active").classed("active", false);
    d3.select("#" + d.properties.slug).classed("active", active = d);
    var b = path.bounds(d);
    g.transition().delay(delay).duration(speed).attr("transform", "translate(" + projection.translate() + ")"
    + "scale(" + scale / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")" + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
}
function zoomOut(duration, delay) {
    delay = delay || 0;
    duration = duration || 500;
    g.transition().duration(duration).delay(delay).attr("transform", "");
}

$(document).ready(main);