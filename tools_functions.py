import pandas as pd
import geojson
import json
import datetime
import glob
import os

max_number_of_anomalies = {
    "Dawn": 0,
    "Morning": 0,
    "Afternoon": 0,
    "Night": 0
}

def merge_csv_to_geojson(geojsonFilename, csvFilename, destFilename):
    csv_dict = transform_csv_to_dict_records(csvFilename)
    
    with open(geojsonFilename, "r") as f:
        dataGEOJSON = json.load(f)
        f.close()

    geojson = {
        "type" : "FeatureCollection",
        "features" : []
    }

    i = 0
    for feature in dataGEOJSON['features']:
        default_properties = {
            "stroke": "white",
            "stroke-width": 0,
            "stroke-opacity": 0,
            "fill": "#808080",
            "fill-opacity": 0.5,
        }

        key = feature['id']
        geojson['features'].append(feature)
        geojson['features'][i]['properties'] = default_properties
        try:
            if(csv_dict[key]):
                color = get_cluster_color(csv_dict[key])
                geojson['features'][i]['properties']['fill'] = color
                geojson['features'][i]['properties']['activity'] = csv_dict[key]['activity']
        except KeyError:
            pass 
        i+=1

    with open(destFilename, "w") as outfile:
        json.dump(geojson, outfile)
        outfile.close()

def get_cluster_color(dict_value):
    # #E15759 cluster 1 red
    # #FFBE7D cluster 2 salmon
    # #4DBBD5 cluster 3 light blue
    # #3C5488 cluster 4 dark blue
    # #009F86 cluster 5 green moss
    switcher = {
        1 : '#E15759',
        2 : '#FFBE7D',
        3 : '#4DBBD5',
        4 : '#3C5488',
        5 : '#009F86'
    }
    return switcher.get(dict_value['cluster'])


def transform_csv_to_dict_index(csvFilename):
    return pd.read_csv(csvFilename).to_dict('index')

def transform_csv_to_dict_records(csvFilename):
    dataCSV = pd.read_csv(csvFilename).to_dict('records')

    csv_dict = {}
    activity = []

    init_key = dataCSV[0]['square_id']

    for elem in dataCSV:
        if(init_key == elem['square_id']):
            activity.append((elem['activity_time'], elem['energy']))
            csv_dict[init_key] = {
                "square_id": elem['square_id'],
                "activity_date": elem['activity_date'],
                "cluster": elem['cluster']
            }
        else:
            csv_dict[init_key]['activity'] = activity.copy()
            activity.clear()
            activity.append((elem['activity_time'], elem['energy']))
            init_key = elem['square_id']
            csv_dict[init_key] = {
                "square_id": elem['square_id'],
                "activity_date": elem['activity_date'],
                "cluster": elem['cluster']
            }
    csv_dict[init_key]['activity'] = activity.copy()
    
    return csv_dict
     
    
def write_csv(destFilename, data):
    dataCSV = pd.DataFrame.from_dict(data, orient='index')
    dataCSV.to_csv(destFilename, index=False)
    

def split_csv_by_day(csvFilename):
    dataCSV = pd.read_csv(csvFilename).to_dict('index')
    initial = dataCSV[0]
    dict_of_the_day = {}
    for key, value in dataCSV.items():
        if(initial['activity_date'] == value['activity_date']):
            dict_of_the_day[key] = value
        else:
            write_csv("dados\\days\\" + initial['activity_date']+".csv", dict_of_the_day)
            initial = value
            dict_of_the_day.clear()
    initial = value
    write_csv("dados\\days\\" + initial['activity_date']+".csv", dict_of_the_day)
    dict_of_the_day.clear()

def merge_all_days_to_geojson(folder_path):
        os.chdir(folder_path)
        for filename in glob.glob("*.csv"):
            merge_csv_to_geojson("C:\\Users\\ggpsg\\Dropbox\\TCC\\2_2020\\Milan-Cluster\\Milan-Cluster\\dados\\milano-grid.geojson", 
            filename, 
            "C:\\Users\\ggpsg\\Dropbox\\TCC\\2_2020\\Milan-Cluster\\Milan-Cluster\\dados\\geojsons\\" + filename[:-4] + ".geojson")

def count_the_max_number_of_anomalies_from_csv(folder_path):
    os.chdir(folder_path)
    for filename in glob.glob("*.csv"):
        csv_dict = transform_csv_to_dict_records(filename)
        for key in csv_dict:
            set_max_number_of_anomalies(csv_dict[key]['activity'])
        
    print(max_number_of_anomalies)
    
def set_max_number_of_anomalies(activity_ls):
    global max_number_of_anomalies
    number_of_anomalies = {
        "Dawn": 0,
        "Morning": 0,
        "Afternoon": 0,
        "Night": 0
    }

    for activity in activity_ls:
        moment = give_moment_of_time(activity[0])
        number_of_anomalies[moment] += 1
    
    for key in number_of_anomalies:
        if(max_number_of_anomalies[key] < number_of_anomalies[key]):
            max_number_of_anomalies[key] = number_of_anomalies[key]
    
    number_of_anomalies.clear()

def give_moment_of_time(time):
    if(time >= 0 and time < 6):
        return "Dawn"
    elif(time >= 6 and time < 12):
        return "Morning"
    elif(time >= 12 and time < 18):
        return "Afternoon"
    elif(time >= 18 and time < 24):
        return "Night"
    

split_csv_by_day("dados\milan-sorted.csv")
merge_all_days_to_geojson("dados\days")
# transform_csv_to_dict_records("dados\\temp.csv")
# count_the_max_number_of_anomalies_from_csv("\dados\days")    


