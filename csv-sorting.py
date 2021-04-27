import pandas as pd

def sort_csv_by_activity_date_and_activity_time(raw_csv, destFilename):

    data = pd.read_csv(raw_csv)[['square_id','activity_date', 'cluster', 'activity_time', 'energy']]
    data.sort_values(by=['activity_date','square_id','activity_time'], ascending=True, inplace=True)
    data.to_csv(destFilename, index=False)

# tem que rodar duas vezes, uma para descobri dados que não significam nada no final a partir dos dados originais
# e outra vez vez a partir dos dados limpos para organizar corretamente
# sort_csv_by_activity_date_and_activity_time("C:\\Users\\ggpsg\\Downloads\\Dados\\full-activity-anomalies_minutes-nov1dec22-raw.csv",
#     "dados\\milan-sorted.csv")

sort_csv_by_activity_date_and_activity_time("dados\milan-sorted.csv", "dados\\milan-sorted.csv")

print(pd.read_csv("dados\\milan-sorted.csv").head())
