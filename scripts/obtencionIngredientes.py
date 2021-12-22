import pandas as pd
import requests, re


def quitar_tildes(texto):
    raw_text = re.sub(u"[Áá]", 'a', texto)
    raw_text = re.sub(u"[Éé]", 'e', raw_text)
    raw_text = re.sub(u"[Íí]", 'i', raw_text)
    raw_text = re.sub(u"[Óó]", 'o', raw_text)
    raw_text = re.sub(u"[úÚ]", 'u', raw_text)
    return raw_text

pd.set_option('display.max_columns', 15)
pd.set_option('display.max_rows', 4186)
recetas = pd.read_csv('./kiwilimon.csv')


with open('data.txt', 'r') as file:
    data = file.read()
print(data)

url = "https://bedca.net/bdpub/procquery.php"
session=requests.Session()
proxies = {"http": "http://127.0.0.1:8080","https": "http://127.0.0.1:8080"}
headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
        "Content-Type":"application/x-www-form-urlencoded",
        "Accept": "application/json, text/plain, */*",
        "Cookie": "PHPSESSID=25010fac417c7e6c1c181bcc25bf2c32",
        "Origin": "https://bedca.net",
        "Content-Type": "text/xml",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": "https://bedca.net",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "es-ES,es;q=0.9,zh-TW;q=0.8,zh;q=0.7"
        }

todos = []
for i in range(0, 3787):
    alimentos = []
    palabras = recetas.loc[i,'ingredientes'].replace('|', ' ').replace(',','').split(' ')
    # print(palabras)
    for j in range(0,len(palabras)):
        # print(str(i)+"/"+str(j))
        if palabras[j].isnumeric() and j+1<len(palabras):
            palabra = quitar_tildes(palabras[j+1])
            
            if palabra.lower() in data:
                alimentos.append(palabra.lower())
        else:
            print(end="")
        
        if palabras[j] == "de":
            try:
                str(eval(palabras[j+1])).replace('.','',1).isdigit()
            except:
                palabra = quitar_tildes(palabras[j+1])
                if palabra.lower() in data:
                    # print(palabra)
                    alimentos.append(palabra.lower())
        else:
            print(end="")
    todos.append(alimentos)
    # print(todos)



data = {
        'name': [],
        'time': [],
        "dificultad": [],
        "tipo_de_plato": [],
        "ingredientes": [],
        "valoracion": [],
        "calorias": [],
        "carbohidratos": [],
        "proteina": [],
        "grasa": [],
        "fibra": [],
        "azucares": [],
        "colesterol": []
        }

nuevo = pd.DataFrame(data)
suma = 0
for i in range(0, len(todos)):
    for j in range(0, len(todos[i])):
        nuevo = nuevo.append(recetas.loc[i,:], ignore_index=True)
        nuevo.loc[j+suma,'ingredientes'] = todos[i][j]
    suma += len(todos[i])


print(nuevo.isnull().sum())
print("\n")
nuevo["calorias"] = pd.to_numeric(nuevo["calorias"])
print(nuevo.calorias.dtype)

nuevo.to_csv(r'D:/Bussiness intelligence/nuevooooo.csv', index = False, header=True)
