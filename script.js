//Init map layer
let mapid = document.getElementById("map");
let mymap = L.map(mapid).setView([45.4729, 9.2187], 13);
let geojsonLayers = [];
//Init datepicker
let datepicker = document.getElementById("datepicker");

//Load page
document.addEventListener("DOMContentLoaded", loadPage, false);

//Events
$("#datepicker").datepicker({

        "format": 'yyyy-mm-dd',
        "startDate": '2013-11-01',
        "endDate": '2013-12-22'

    }).on("changeDate", e => {
        console.log(e)
        removeGeojsonLayers(mymap, geojsonLayers)
        geojsonLayers = []
        loadGeojson(datepicker.value, mymap, geojsonLayers);
    });


// ####################################

function loadMap(mapLayer){
    
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 11,
        maxZoom: 14,
        accessToken: 'pk.eyJ1IjoiZ2dwc2dlb3JnZSIsImEiOiJja2xoNjRoNnk1YnRnMnJwbGhjdjdkMW9lIn0.kn_ZuIZt6PkfprwNnUPRwg'
    }).addTo(mapLayer);

    // limit the map bounds
    let corner1 = L.latLng(45.35880131440966, 9.0114910478323);
    let corner2 = L.latLng(45.56567970366364, 9.309665139520197);
    let bounds = L.latLngBounds(corner1, corner2);
    
    mapLayer.setMaxBounds(bounds);
    mapLayer.on('drag', function(){
        mapLayer.panInsideBounds(bounds, {animate: false});
    });
}

function loadGeojson(date = "2013-11-01", mapLayer, geojsonLayers){
    $.getJSON("dados\\geojsons\\"+date+".geojson", function(data) {
        data["features"].forEach(element => {
            let geojsonLayer = L.geoJSON(element["geometry"], {
                color: element["properties"]["stroke"],
                fillColor: element["properties"]["fill"],
                fillOpacity: element["properties"]["fill-opacity"],
                opacity: element["properties"]["stroke-opacity"],
                weight: element["properties"]["stroke-width"],
                id: element["id"],
                activity: element["properties"]["activity"],
                onEachFeature: onEachFeature
            });
            geojsonLayers.push(geojsonLayer);
            geojsonLayer.addTo(mapLayer);
        });
    });
}

function removeGeojsonLayers(mymap, geojsonLayers) {
    geojsonLayers.forEach(layer => {
        mymap.removeLayer(layer)
    })
}

function loadDatepicker(){
// Datapicker init
    $("#datepicker").datepicker({
        "format": 'yyyy-mm-dd',
        "startDate": '2013-11-01',
        "endDate": '2013-12-22'
    });
}

function loadPage(){
    loadMap(mymap);
    loadDatepicker(datepicker)
    console.log(datepicker)
    if(datepicker.value == ""){datepicker.value = datepicker.placeholder}
    loadGeojson(datepicker.value, mymap, geojsonLayers);
}

// let modal = document.getElementById("modalId");
// let export_btn = document.getElementById("export-btn");
// let span = document.getElementsByClassName("close")[0];

// export_btn.onclick = function() {
//     modal.style.display = "block";
// }

// span.onclick = function() {
//     modal.style.display = "none";
// }

// window.onclick = function(event) {
//     if(event.target == modal){
//         modal.style.display = "none";
//     }
// }

function onEachFeature(feature, layer){
    layer.on('click', function(){
        
        let activity = layer["defaultOptions"]["activity"];
        let activityObjs = []
        // console.log(layer["defaultOptions"]["id"]);
        // console.log(layer["defaultOptions"]["activity"])
        activity.forEach(array => {
            activityObjs.push({time: array[0], energy: array[1]});
        });

        // console.log(activityObjs);
        let bar_data = process_data(activityObjs)
        console.log(bar_data);
        render_bars(bar_data);

    });
}

//Bar scripts

function render_bars(data){

    d3.select('.bar').selectAll('*').remove();
    
    let svg_bar = d3.select(".bar");
    const margin = {top: 20, bottom: 20, left: 40, right: 20};
    const innerWidth = svg_bar.attr("width") - margin.left - margin.right;
    const innerHeight = svg_bar.attr("height") - margin.top - margin.bottom;
    const xValue = elem => elem.moment;
    const yValue = elem => elem.number_of_anomalies;
    
    const xScale = d3.scaleBand()
        .domain(["Dawn", "Morning", "Afternoon", "Night"])
        .range([0, innerWidth])
        .padding(0.07);

    const xAxis = d3.axisBottom(xScale);

    const yScale = d3.scaleLinear()
        .domain([0, 40]) 
        .range([innerHeight, 0]);

    const yAxis = d3.axisLeft(yScale);

    const g_cluster = svg_bar.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    g_cluster.append("g").call(xAxis)
        .attr("font-size", "10px")
        .attr("transform", `translate(0, ${innerHeight})`);
    
    g_cluster.append("g").call(yAxis);

    // insert grid 
    g_cluster.append("g")
        .attr('class', 'grid')
        .call(d3.axisLeft()
            .scale(yScale)
            .tickSize(-innerWidth, 0, 0)
            .tickFormat(''))

    g_cluster.selectAll("rect").data(data)
        .enter().append("rect")
            .attr("x", d => xScale(xValue(d)))
            .attr("y", d => yScale(yValue(d)))
            .attr("height", d => innerHeight - yScale(yValue(d)))
            .attr("width", xScale.bandwidth());

    // labels
    // Y label
    g_cluster.append('text')
        .attr('x', -(innerHeight / 2.5) - margin.top)
        .attr('y', -margin.left / 1.6)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Number of anomalies')
    
}

function process_data(data) {

    console.log(data);

    let bar_data = [];
    let init_moment = give_moment_of_time(data[0].time);
    let anomalies_counter = 0;

    data.forEach(elem => {
        let actual_moment = give_moment_of_time(elem.time);
        if(actual_moment == init_moment) {
            anomalies_counter += 1;
        }else{
            bar_data.push({moment: init_moment, number_of_anomalies: anomalies_counter});
            init_moment = actual_moment;
            anomalies_counter = 1;
        }        
    })
    // last obj
    bar_data.push({moment: init_moment, number_of_anomalies:anomalies_counter})

    return bar_data;
}

function give_moment_of_time(time) {
    if(time >= 0 && time < 6){
        return "Dawn";
    }else if(time >= 6 && time < 12){
        return "Morning";
    }else if(time >= 12 && time < 18){
        return "Afternoon";
    }else if(time >= 18 && time < 24){
        return "Night";
    }
}



