import pandas as pd
import geojson
import json
import datetime

# def tranformCSV_toJsonFile(csvFilename, destFilename):

#     dataFrame = pd.read_csv(csvFilename)[['square_id','activity_date','cluster','activity_time','energy']].to_dict('index')
#     # print(dataFrame)
#     with open(destFilename, "w") as outfile:
#         json.dump(dataFrame, outfile, indent=4)

def add_csv_data_to_json(geojsonFilename, csvFilename, destFilename):
    dataCSV = pd.read_csv(csvFilename).to_dict('index')
    # print(dataCSV[0], end="\n")

    with open(geojsonFilename, "r") as f:
        dataGEOJSON = json.load(f)
        f.close()
    # print(dataGEOJSON['features'][0]['geometry']['coordinates'], end="\n")
    # print(dataGEOJSON['features'][0]['properties'], end="\n")

    # JUNTAR OS DADOS PARA UM GEOJSON UNICO
    geojson = {} 
    # dataCSV suas keys são indexes
    for i in range(len(dataGEOJSON)):
        # print(dataCSV[i])
        # print(dataGEOJSON['features'][i]['properties'])
        try:
            if(dataGEOJSON['features'][i]['id'] in dataCSV):
                dataGEOJSON['features'][i]['properties'].update(dataCSV[i])
        except IndexError:
            break

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
        
# add_csv_data_to_json("dados\\teste.geojson", "dados\\milan-sorted.csv", "dados\\csv-geojson-merged.geojson")
# split_csv_by_week("dados\\milan-sorted.csv")

#E15759 cluster 1 vermelho
#FFBE7D cluster 2 salmao
#4DBBD5 cluster 3 azul claro
#3C5488 cluster 4 azul escuro
#009F86 ckuster 5 verde musgo