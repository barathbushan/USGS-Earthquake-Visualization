var count = 0;
function httpGet(theUrl) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send();

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {

            parseData(JSON.parse(xmlHttp.responseText));
            var delCount = count - 1;
            console.log("delete Count  : " + delCount)
            if (document.getElementById("worldMap" + delCount)) {
                document.getElementById("worldMap" + delCount).style.display = 'none';
            }
        }
    }
}

var getTitle = function (JSON_response) {

    return JSON_response.metadata.title;
};

httpGet("http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson");

var parseData = function (JSON_response) {

    count++;
    var earthQuakeData = JSON_response.features;
    var countries_list = [];
    var mapTitle = JSON_response.metadata.title;
    console.log("Printing Response ");
    //    console.log(JSON_response["type"]);

    document.getElementById("heading").innerText = JSON_response.metadata.title;

    var getTitle = function () {
        return JSON_response.metadata.title;
    };

    var getLocations = function () {
        var coordinates, locationInfo,
            latLng_List = [];
        for (var index in earthQuakeData) {
            if (earthQuakeData[index].geometry.type === "Point") {
                coordinates = earthQuakeData[index].geometry.coordinates;
                var magnitude = earthQuakeData[index].properties.mag;
                var time = new Date(parseInt(earthQuakeData[index].properties.time));
                locationInfo = {};
                locationInfo.long = coordinates[0];
                locationInfo.lat = coordinates[1];
                locationInfo.magnitude = magnitude;
                locationInfo.place = earthQuakeData[index].properties.place;
                locationInfo.time = time.toLocaleString();
                if (magnitude > 0) {
                    latLng_List.push(locationInfo);
                }
            }
        }
        return latLng_List;
    };

    //    console.log(getLocations());
    //    console.log("Displaying all earthQuake PLACES..")
    for (var index in earthQuakeData) {
        parsed = earthQuakeData[index].properties.place.split(",");
        countries_list.push(parsed[1]);
    }
    //    console.log(countries_list);
    constructMap(900, 750, getLocations());
};

var constructMap = function (width, height, MarkersData) {
    // $('#worldMap').hide();
    var projection = d3.geo.mercator()
        .scale((width + 1) / 2 / Math.PI)
        .translate([width / 2, height / 2])
        .precision(.1);
    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 9])
        .on("zoom", move);
    var move= function() {

        var t = d3.event.translate;
        var s = d3.event.scale;
        zscale = s;
        var h = height/4;


        t[0] = Math.min(
                (width/height)  * (s - 1),
            Math.max( width * (1 - s), t[0] )
        );

        t[1] = Math.min(
                h * (s - 1) + h * s,
            Math.max(height  * (1 - s) - h * s, t[1])
        );

        zoom.translate(t);
        g.attr("transform", "translate(" + t + ")scale(" + s + ")");

        //adjust the country hover stroke width based on zoom level
        d3.selectAll(".country").style("stroke-width", 1.5 / s);

    };

    var svg = d3.select("#D3VisualizationMap").append("svg")
        .attr("class", "map")
        .attr("id", "worldMap" + count)
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    var layer = svg.append("div")
        .attr("class", "layer");

    var info = svg.append("div")
        .attr("class", "info");

    var path = d3.geo.path()
        .projection(projection);
    var g = svg.append("g");

    d3.json("world-110m2.json", function (error, topology) {
        g.selectAll("path")
            .data(topojson.object(topology, topology.objects.countries)
                .geometries)
            .enter()
            .append("path")
            .attr("d", path);

//            svg.selectAll(".mark")
//                .data(MarkersData)
//                .enter()
//                .append("image")
//                .attr('class','mark')
//                .attr('width', 20)
//                .attr('height', 20)
//                .attr("xlink:href",'redmapmarker.png')
//                .attr("transform", function(d) {return "translate(" + projection([d.long,d.lat]) + ")";});
//
        g.selectAll("circle")
            .data(MarkersData)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection([d.long, d.lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.long, d.lat])[1];
            })
            .attr("r", function (d) {
                return d.magnitude;
            })
            .style("fill", "red")
            .on('mouseover', function (d) {
                d3.select(this).style({fill: 'blue'});
                var String = "Place : " + d.place +
                            "\n" + "Magnitude :"+ d.magnitude +
                            "\n" + "Time :"+ d.time ;
                tooltip.text(String);
                tooltip.style("visibility", "visible");

                return
            })
            .on('mouseout', function (d, i) {
                d3.select(this).style({fill: 'red'});
                return tooltip.style("visibility", "hidden");
            });

        var tooltip = d3.select("#selector")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .text("a simple tooltip");
    });

}




