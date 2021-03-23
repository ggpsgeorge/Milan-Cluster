import pandas as pd
import geojson
import json

def tranformCSV_toJsonFile(csvFilename, destFilename):

    dataFrame = pd.read_csv(csvFilename)[['id','square_id','activity_date','activity_time','energy','cluster']].to_dict('index')
    # print(dataFrame)
    with open(destFilename, "w") as outfile:
        json.dump(dataFrame, outfile, indent=4)

# with open("dados\\milano-grid.geojson") as f:
#     geoj = geojson.load(f)
#     print(geoj["features"][0])

tranformCSV_toJsonFile("dados\\milan-sorted.csv", "dados\\datafromJson.json")

