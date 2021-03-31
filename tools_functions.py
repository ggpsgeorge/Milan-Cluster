import pandas as pd
import geojson
import json
import datetime

def merge_csv_to_geojson(geojsonFilename, csvFilename, destFilename):
    dataCSV = pd.read_csv(csvFilename).to_dict('index')
    print(dataCSV[0], end="\n")

    with open(geojsonFilename, "r") as f:
        dataGEOJSON = json.load(f)
        f.close()
    # print(dataGEOJSON['features'][0]['geometry']['coordinates'], end="\n")
    # print(dataGEOJSON['features'][0]['properties'], end="\n")
    for i in range(len(dataGEOJSON)): 
        pass
        # JUNTAR OS DADOS PARA UM GEOJSON UNICO
        # dataCSV suas keys são indexes
    

# split by week the csv that must be ordered
def split_csv_by_week(csvFilename):
    dataCSV = pd.read_csv(csvFilename).to_dict('index')
    dict_temp = {}
    day = 27
    previous_day = 20
    month = 12
    previous_month = 12
    for i in range(len(dataCSV)):
        if((pd.Timestamp(2013,previous_month,previous_day) < (datetime.datetime.strptime(dataCSV[i]['activity_date'], "%Y-%m-%d")) <= (pd.Timestamp(2013,month,day)))):
            dict_temp[i] = dataCSV[i]
    dataCSV.clear()
    dataCSV = pd.DataFrame.from_dict(dict_temp, orient='index')
    week = 8
    dataCSV.to_csv("dados\\milan-sorted-week-"+str(week)+".csv", index=False)

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

    
# merge_csv_to_geojson("dados\\teste.geojson", "dados\\milan-sorted-week-1.csv", "dados\\cluster-week-1.geojson")
# split_csv_by_week("dados\\milan-sorted.csv")
split_csv_by_day("dados\\milan-sorted.csv")

# #E15759 cluster 1 vermelho
# #FFBE7D cluster 2 salmao
# #4DBBD5 cluster 3 azul claro
# #3C5488 cluster 4 azul escuro
# #009F86 ckuster 5 verde musgo