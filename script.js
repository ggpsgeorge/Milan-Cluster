//Init map layers
let mapid = document.getElementById("map");
let mymap = L.map(mapid).setView([45.4729, 9.2187], 13);
let geojsonLayers = [];
//Marker var
let mark = undefined;

let datepicker = document.getElementById("datepicker");

let modal = document.getElementById("modalId");
let export_button = document.getElementById("export-button");
let closeButtonModal = document.getElementById("close-button-modal");

export_button.addEventListener("click", function() {
    modal.style.display = "block";
});;

closeButtonModal.addEventListener("click", function() {
    modal.style.display = "none";
});

window.addEventListener("click", function() {
    if(event.target == modal){
        modal.style.display = "none";
    }
});


//Load page
document.addEventListener("DOMContentLoaded", loadPage, false);

//Events
$("#datepicker").datepicker({

        "format": 'yyyy-mm-dd',
        "startDate": '2013-11-01',
        "endDate": '2013-12-22',
        "maxViewMode": 1,

    }).on("changeDate", e => {
        removeMarker(mymap, mark);
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
        maxZoom: 18,
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
        "endDate": '2013-12-22',
        "maxViewMode": 1,
        
    });
}

function loadPage(){

    loadMap(mymap);
    loadDatepicker(datepicker)

    if(datepicker.value == ""){datepicker.value = datepicker.placeholder}
    loadGeojson(datepicker.value, mymap, geojsonLayers);
    
}


function onEachFeature(feature, layer, mapLayer = mymap){
    layer.on('click', function(){

        let activity = layer["defaultOptions"]["activity"];
        let activityObjs = []

        activity.forEach(array => {
            activityObjs.push({time: array[0], energy: array[1]});
        });
        
        // console.log(activityObjs);

        let polygonBound = L.latLngBounds(layer._latlngs[0][0], layer._latlngs[0][2]);

        let center = polygonBound.getCenter();

        let bar_data = process_data(activityObjs)

        if(mark == undefined){
            createMarker(mapLayer, center, bar_data, activityObjs);
        }else{
            removeMarker(mapLayer, mark);
            createMarker(mapLayer, center, bar_data, activityObjs);
        }  
    });
}

function createMarker(mapLayer, center, bar_data, energy_data){
    let centerString = (Object.values(center)); 
    centerString = "Lat: " + centerString[0] + " Lon: " + centerString[1];

    let myIcon = L.icon({
        iconUrl: "white_block_icon.png",
        iconSize: [38, 38],
        iconAnchor: [22, 38],
        popupAnchor: [0, 0],
    })
    
    let content = document.getElementById("popup_template").innerHTML;

    mark = L.marker(center, {icon: myIcon});
    mark.setOpacity(0);
    mark.addTo(mapLayer);
    
    
    mark.bindPopup(content, {
        minWidth: "250",
        maxWidth: "400",
    }).openPopup();

    let chart_button = document.getElementById("chart-button");
    let close_button = document.getElementById("close-button");
    let latlong = document.getElementById("latlong");

    latlong.innerText = centerString;

    let number_anomalies_chart = undefined;
    // let energy_time_chart = undefined;

    chart_button.addEventListener("click", function(){
        addOverlay()
        number_anomalies_chart = drawNumberOfAnomaliesChart(bar_data)
        // energy_time_chart = drawEnergyTimeChart(energy_data)
    }, false);
    close_button.addEventListener("click", function(){
        number_anomalies_chart.destroy();
        // energy_time_chart.destroy();
        removeOverlay();
    }, false);

    mark.update();
    
}

function removeMarker(mapLayer, marker) {
    mapLayer.removeLayer(marker);
}

function addOverlay(){
    document.getElementById("overlay").style.display = "block";
}

function removeOverlay(){
    document.getElementById("overlay").style.display = "none";
}

function process_data(data) {
    
    console.log(data)

    let bar_data = {
        'Dawn' : 0,
        'Morning': 0,
        'Afternoon': 0,
        'Night': 0
    };

    data.forEach(element => {
        switch(give_moment_of_time(element.time)){
            case 'Dawn': 
                bar_data['Dawn'] += 1;
                break;
            case 'Morning': 
                bar_data['Morning'] += 1;
                break;
            case 'Afternoon': 
                bar_data['Afternoon'] += 1;
                break;
            case 'Night': 
                bar_data['Night'] += 1;
                break;
        }
    });

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

// Charts

function drawNumberOfAnomaliesChart(bar_data){ 
    
    data_number_of_anomalies = [bar_data['Dawn'], bar_data['Morning'], bar_data['Afternoon'], bar_data['Night']];
    
    let number_anomalies_chart = document.getElementById("number-anomalies-chart");
    
    let ctx = number_anomalies_chart.getContext('2d');

    

    let anomalies_chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Dawn', 'Morning', 'Afternoon','Night'],
            datasets: [{
                label: 'Number of Anomalies',
                data: data_number_of_anomalies,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(164, 164, 164, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(164, 164, 164, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 40,
                }
            }
        }
    });
    return anomalies_chart;
}

function drawEnergyTimeChart(energy_data){
    
}

