//Init map layers
let mapid = document.getElementById("map");
let mymap = L.map(mapid).setView([45.4729, 9.2187], 13);
let geojsonLayers = [];
let popUpInformation = [];
//Marker var
let mark = undefined;

let datepicker = document.getElementById("datepicker");

// para n maior que 30
let z_value = 1.960;

// para n menor ate 30
let tDistribution = [
    12.70620474,
    4.30265273,
    3.182446305,
    2.776445105,
    2.570581836,
    2.446911851,
    2.364624252,
    2.306004135,
    2.262157163,
    2.228138852,
    2.20098516,
    2.17881283,
    2.160368656,
    2.144786688,
    2.131449546,
    2.119905299,
    2.109815578,
    2.10092204,
    2.093024054,
    2.085963447,
    2.079613845,
    2.073873068,
    2.06865761,
    2.063898562,
    2.059538553,
    2.055529439,
    2.051830516,
    2.048407142,
    2.045229642,
    2.042272456,
];

//Load page
document.addEventListener("DOMContentLoaded", loadPage, false);

//Events
$("#datepicker").datepicker({

        "format": 'yyyy-mm-dd',
        "startDate": '2013-11-01',
        "endDate": '2013-12-22',
        "maxViewMode": 1,

    }).on("changeDate", e => {
        if(mark == undefined){
            removeGeojsonLayers(mymap, geojsonLayers)
            geojsonLayers = []
            loadGeojson(datepicker.value, mymap, geojsonLayers);
        }else{
            removeMarker(mymap, mark);
            removeGeojsonLayers(mymap, geojsonLayers)
            geojsonLayers = []
            loadGeojson(datepicker.value, mymap, geojsonLayers);
        }
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

function loadModal(datepicker){
    
    let modal = document.getElementById("modalId");
    let export_button = document.getElementById("export-button");
    let closeButtonModal = document.getElementById("close-button-modal");

    export_button.addEventListener("click", function() {
        modal.style.display = "block";
        
        if(datepicker.value == ""){datepicker.value = datepicker.placeholder}

        let geojson_file = datepicker.value+".geojson"
        let csv_file = datepicker.value+".csv"
        
        download_geojson_link = document.getElementById("download-geojson-link");
        download_csv_link = document.getElementById("download-csv-link")
        download_geojson_link.href += geojson_file;
        download_csv_link.href += csv_file;
        
        download_geojson_button = document.getElementById("download-geojson-button");
        download_csv_button = document.getElementById("download-csv-button")
        download_geojson_button.innerHTML = geojson_file;
        download_csv_button.innerHTML = csv_file;

    });

    closeButtonModal.addEventListener("click", function() {
        modal.style.display = "none";
        download_geojson_link.href = "dados\\geojsons\\";
        download_csv_link.href = "dados\\days\\";
    });

    window.addEventListener("click", function(e) {
        if(e.target == modal){
            modal.style.display = "none";
            download_geojson_link.href = "dados\\geojsons\\";
            download_csv_link.href = "dados\\days\\";
        }
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
    loadModal(datepicker)

    if(datepicker.value == ""){datepicker.value = datepicker.placeholder}
    loadGeojson(datepicker.value, mymap, geojsonLayers);
    
}


function onEachFeature(feature, layer, mapLayer = mymap){
    layer.on('click', function(){

        let activity = layer["defaultOptions"]["activity"];

        if(activity == undefined){
            activity = [];
        }
        let activityObjs = []

        activity.forEach(array => {
            activityObjs.push({time: array[0], energy: array[1]});
        });
        
        let polygonBound = L.latLngBounds(layer._latlngs[0][0], layer._latlngs[0][2]);

        let center = polygonBound.getCenter();

        let bar_data = process_data(activityObjs);

        let id = layer['options']['id'];

        if(mark == undefined){
            createMarker(mapLayer, center, bar_data, activityObjs, id);
        }else{
            removeMarker(mapLayer, mark);
            createMarker(mapLayer, center, bar_data, activityObjs, id);
        }  
    });
}

function createMarker(mapLayer, center, bar_data, energy_data, id){
    
    let centerString = (Object.values(center));
    centerString = "[" + centerString[0].toFixed(5) + " , " + centerString[1].toFixed(5)+"]";

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
    
    mark.bindPopup(content).openPopup();

    let chart_button = document.getElementById("chart-button");
    let close_button = document.getElementById("close-button");
    let latlong = document.getElementById("latlong");
    let square_id = document.getElementById("square-id");
    let total_sum_anomalies = document.getElementById("total-sum-anomalies");

    square_id.innerHTML = `ID: ${id}`;
    total_sum_anomalies.innerHTML = count_total_number_of_anomalies(bar_data) + " Anomalies";
    latlong.innerHTML = centerString;

    let number_anomalies_chart = undefined;
    let energy_time_scatter_chart = undefined;
    let energy_mean_chart = undefined;

    if(energy_data.length == 0){
        chart_button.innerText = "No information";
        chart_button.disabled = true;
    }

    chart_button.addEventListener("click", function(){
        addOverlay()
        number_anomalies_chart = drawNumberOfAnomaliesChart(bar_data);
        energy_time_scatter_chart = drawEnergyTimeScatterChart(energy_data);
        energy_mean_chart = drawEnergyMeanChart(energy_data, bar_data);
    }, false);

    close_button.addEventListener("click", function(){
        number_anomalies_chart.update();
        energy_time_scatter_chart.update();
        energy_mean_chart.update();
        number_anomalies_chart.destroy();
        energy_time_scatter_chart.destroy();
        energy_mean_chart.destroy();
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

function transform_decimal_time_in_time_format(decimal_time){

    let decimal_rest = decimal_time%1
    let hours = Math.floor(decimal_time);
    let mins = decimal_rest*60;
    decimal_rest = mins%1;
    mins = Math.floor(mins);
    let secs = Math.floor(decimal_rest*60);

    let total_secs = hours*3600 + mins*60 + secs

    if(hours < 10){hours = "0"+hours};
    if(mins < 10){mins = "0"+mins};
    if(secs < 10){secs = "0"+secs};
    
    return {
            "time": `${hours}:${mins}:${secs}`,
            "total_secs": total_secs    
        };

}

function count_total_number_of_anomalies(bar_data){

    let array = Object.values(bar_data);
    let sum = 0;

    array.forEach(function(e){
        sum += e;
    })

    return sum

}

function calculate_anomalies_mean(energy_data, process_data){

    let mean = {
        "Dawn": 0,
        "Morning": 0,
        "Afternoon": 0,
        "Night": 0
    };

    energy_data.forEach(function(elem){
        let moment = give_moment_of_time(elem['time'])
        mean[moment] += elem.energy;
    });
    
    Object.keys(process_data).forEach(function(elem){
        mean[elem] = mean[elem]/process_data[elem];
        if(isNaN(mean[elem])){mean[elem] = 0};
    })
    
    return mean;
}

function calculate_anomalies_standard_deviation_by_time_of_day(energy_data){

    let sample = {
        "Dawn": [],
        "Morning": [],
        "Afternoon": [],
        "Night": []
    };

    let deviation = {
        "Dawn": 0,
        "Morning": 0,
        "Afternoon": 0,
        "Night": 0
    };

    energy_data.forEach(function(e){
        let moment = give_moment_of_time(e.time);
        sample[moment].push(e.energy);
    });

    Object.keys(sample).forEach(function(moment){
        if(sample[moment].length > 0){
            deviation[moment] = math.std(sample[moment])
        }else{
            deviation[moment] = 0;
        }
    });
    
    return deviation;
    
};

function get_degree_of_freedom(number_of_anomalies){
    
    let degree_of_freedom = number_of_anomalies - 1;
    if(degree_of_freedom < 0){degree_of_freedom = 0} 

    return degree_of_freedom
};

function get_t_distribution(degree_of_freedom){
    if(degree_of_freedom > 0 && degree_of_freedom <= 30){
        return tDistribution[degree_of_freedom - 1];
    }else if(degree_of_freedom > 30){
        return z_value;
    }else{
        return 0;
    };
};

function calculate_tStudent(mean, deviation, process_data){

    // let t_student_low = {};
    // let t_student_high = {};
    let t_student = {}

    Object.keys(process_data).forEach(function(key){
        let degree_of_freedom = get_degree_of_freedom(process_data[key]);
        let t_distribution = get_t_distribution(degree_of_freedom);
        let resp = deviation[key]/(Math.sqrt(process_data[key]));
        resp = resp*t_distribution;
        if(isNaN(resp)){resp = 0};
        // t_student_low[key] = mean[key] - resp;
        // t_student_high[key] = mean[key] + resp;
        
        t_student[key] = resp;

    });
    return t_student;
};

// Charts

function create_context_charts(element_id){
    let ctx = document.getElementById(element_id).getContext('2d');
    return ctx
};

function drawNumberOfAnomaliesChart(bar_data){ 
    
    data_number_of_anomalies = [bar_data['Dawn'], bar_data['Morning'], bar_data['Afternoon'], bar_data['Night']];
    
    let ctx = create_context_charts("number-anomalies-chart");

    let anomalies_chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Dawn', 'Morning', 'Afternoon', 'Night'],
            datasets: [{
                label: 'Anomalies',
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
            }],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Number of anomalies",
                },
                legend:{
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 40,
                },
            },
        }
    });
    return anomalies_chart;
};

function drawEnergyTimeScatterChart(energy_data){

    let ctx = create_context_charts("energy-time-scatter-graph");

    let labels = [];
    let timeString_labels = []
    let energy = [];

    energy_data.forEach(function(e){
        let res = transform_decimal_time_in_time_format(e.time);
        timeString_labels.push(res);
        labels.push(res['total_secs']);
        energy.push(e.energy);
    });

    let scatter_chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            labels: labels,
            datasets: [{
                label: '',
                data: energy,
                fill: false,
                borderColor: "#2196f3",
                backgroundColor: "#2196f3"
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    min: -35,
                    max: 5
                },
                x: {
                    beginAtZero: true,
                    min: 0,
                    max: 86400,
                    title: {
                        display: true,
                        text: 'Day in seconds',
                        font: {
                            size: 14,
                        }
                    }
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: "Anomaly Energy(EFC)"
                },
                legend:{
                    display: false,
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: false,
                        },
                        mode: 'xy',
                        drag: {
                            enabled: false,
                        }
                    },
                    limits: {
                        y: {min: -35, max: 0},
                        x: {min: 0, max: 86400}
                    },
                }
            }
        }
    });

    return scatter_chart;
};

function drawEnergyMeanChart(energy_data, process_data){

    let ctx = create_context_charts("energy-mean-graph");

    let mean = calculate_anomalies_mean(energy_data, process_data);

    let deviation = calculate_anomalies_standard_deviation_by_time_of_day(energy_data);
    let mean_error = calculate_tStudent(mean, deviation, process_data);

    console.log(mean_error);

    let mean_chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(process_data),
            datasets: [{
                label: 'Energy Mean(EFC):',
                data: Object.values(mean),
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
                borderWidth: 1,
            }],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Mean - Anomaly Energy(EFC)"
                },
                legend:{
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: -40,
                    max: 10,
                },
            },
        },
    });

    return mean_chart;
};
