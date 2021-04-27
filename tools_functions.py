import pandas as pd
import geojson
import json
import datetime
import glob
import os

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
            "fill-opacity": 0.3,
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

merge_all_days_to_geojson("C:\\Users\\ggpsg\\Dropbox\\TCC\\2_2020\\Milan-Cluster\\Milan-Cluster\\dados\\days")
# split_csv_by_day("dados\\milan-sorted.csv")
# transform_csv_to_dict_records("dados\\days\\2013-11-03.csv")    
# merge_csv_to_geojson("dados\\milano-grid.geojson", "dados\\days\\2013-11-03.csv", "dados\\geojsons\\2013-11-03.geojson")
# # split_csv_by_week("dados\\milan-sorted.csv")

