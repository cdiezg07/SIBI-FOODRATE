from selenium import webdriver
import json
from selenium.webdriver.chrome.options import Options
import by
from requests_html import HTMLSession
import pandas as pd
import re

DRIVER_PATH = "C:Users/carlos/Downloads/chromedriver_win32/chromedriver.exe"

options = Options()
options.headless = False
options.add_argument("--window-size=1920,1200")
driver = webdriver.Chrome(options=options, executable_path=DRIVER_PATH)
driver.get("https://www.kiwilimon.com/")
driver.add_cookie({"name":"siteSession","domain":"kiwilimon.com","value":"D8Jf4XtZ7xGyEs4or1nbGyI7"})

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

df = pd.DataFrame(data)

url = "https://gr.kiwilimon.com/v6/feed"
session = HTMLSession()

for j in range(1,301):
    obj = {
        'v':1,
        'type':'home',
        'key':'',
        'device':'pc',
        'language':'es',
        'quantity':16,
        'order':1,
        'page':j,
        'human':1
    }
    proxies = {"http": "http://127.0.0.1:8080","https": "http://127.0.0.1:8080"}
    r = session.post(url, data=obj, verify=True)
    # print(r.text)
    data = json.loads(r.text)

    for i in range(0,data['quantity']):
        if not('class' in data['payload'][i]):
            
            while True:
                try: 
                    print(data['payload'][i]['n'])
                    url1 = "https://www.kiwilimon.com/" + str(data['payload'][i]['pa'])
                    driver.get(url1)

                    ingredientes = driver.find_element_by_id('ingredients-original').text.replace('\n','|')

                    try:
                        pagina = driver.page_source
                        regex = r'https://cdn7.kiwilimon.com//brightcove(?:[^\\"]|\\")*'
                        
                        matches = re.finditer(regex, pagina, re.MULTILINE)

                        for matchNum, match in enumerate(matches, start=1): 
                            match = match.group()
                        foto = match   
                        # print(foto)
                    except:
                        foto = ''

                    try:
                        prepar = driver.find_element_by_class_name('icon-k7-receta-tpreparacion').text
                    except:
                        prepar = "0"
                    
                    try:
                        coccion = driver.find_element_by_class_name('icon-k7-receta-tcocinar').text
                    except:
                        coccion = "0"

                    if "h" in prepar and "min" in prepar:
                        array = prepar.replace('h','').replace('min', '').split(' ')
                        tiempo1 = int(array[0]) * 60 + int(array[1])
                    elif "h" in prepar:
                        tiempo1 = prepar.strip("h")
                        tiempo1 = int(tiempo1) * 60
                    else:
                        tiempo1 = prepar.split(' ')[0]
                                        
                    if "h" in coccion and "min" in coccion:
                        array = coccion.replace('h','').replace('min', '').split(' ')
                        tiempo1 = int(array[0]) * 60 + int(array[1])
                    elif "h" in coccion:
                        tiempo2 = coccion.strip("h")
                        tiempo2 = int(tiempo2) * 60
                    else:
                        tiempo2 = coccion.split(' ')[0]    

                    tiempo_preparacion = int(tiempo1) + int(tiempo2)
                    dificultad = driver.find_element_by_class_name('icon-k7-receta-tdificultad').text

                    try:
                        user = []
                        for k in range(1, 1000):
                            usuario = driver.find_element_by_xpath("/html/body/div[8]/div[3]/div[3]/div[1]/div[6]/div[10]/div["+str(k)+"]/div[2]").text
                            print(usuario)
                            user.append(usuario)
                        print(user)  

                    except Exception as e:
                        pass

                    try:
                        driver.find_element_by_class_name('recipe-div-nonutriente')
                        calorias = ''
                        carbohidratos = ''
                        proteina = ''
                        grasa = ''  
                        fibra = ''
                        azucares = ''
                        colesterol = ''
                        break
                    except:
                        print("",end='')

                    try:
                        calorias = driver.find_element_by_class_name('recipe_nutriente_208').text.split('\n')[1]
                    except:
                        print("",end='')
                        calorias = 'a mano'
                        break

                    try:
                        colesterol = driver.find_element_by_class_name('recipe_nutriente_601').text.split('\n')[1]
                    except:
                        print("",end='')
                        colesterol = 'a mano'
                        break

                    try:
                        carbohidratos = driver.find_element_by_class_name('recipe_nutriente_205').text.split('\n')[1]
                    except:
                        print("",end='')
                        carbohidratos = 'a mano'
                        break

                    try:
                        proteina = driver.find_element_by_class_name('recipe_nutriente_203').text.split('\n')[1]
                    except:
                        print("",end='')
                        proteina = 'a mano'
                        break

                    try:
                        grasa = driver.find_element_by_class_name('recipe_nutriente_204').text.split('\n')[1]
                    except:
                        print("",end='')
                        grasa = 'a mano'
                        break

                    try:
                        fibra = driver.find_element_by_class_name('recipe_nutriente_291').text.split('\n')[1]
                    except:
                        print("",end='')
                        fibra = 'a mano'
                        break
                    
                    try:
                        azucares = driver.find_element_by_class_name('recipe_nutriente_269').text.split('\n')[1]
                    except:
                        print("",end='')
                        azucares = 'a mano'
                        break

                    calorias = driver.find_element_by_class_name('recipe_nutriente_208').text.split('\n')[1]
                    carbohidratos = driver.find_element_by_class_name('recipe_nutriente_205').text.split('\n')[1]
                    proteina = driver.find_element_by_class_name('recipe_nutriente_203').text.split('\n')[1]
                    grasa = driver.find_element_by_class_name('recipe_nutriente_204').text.split('\n')[1]
                    fibra = driver.find_element_by_class_name('recipe_nutriente_291').text.split('\n')[1]
                    azucares = driver.find_element_by_class_name('recipe_nutriente_269').text.split('\n')[1]
                    colesterol = driver.find_element_by_class_name('recipe_nutriente_601').text.split('\n')[1]
                    break
                except Exception as e:
                    print("",end='')
                    print(e)
                    

            new_row = {'name':data['payload'][i]['n'], 'link':url1, 'fotografia':match, 'time':tiempo_preparacion, 'dificultad':dificultad, 'tipo_de_plato':'', 'ingredientes':ingredientes, 'valoracion': '', 
                        'calorias':calorias, 'carbohidratos':carbohidratos, 'proteina': proteina, 'grasa':grasa, 'fibra':fibra, 'azucares':azucares, 'colesterol':colesterol}
            #append row to the dataframe
            df = df.append(new_row, ignore_index=True)
            print(df)
            print(str(calorias)+"\n"+str(carbohidratos)+"\n"+str(proteina))
df.to_csv (r'D:/Bussiness intelligence/UsuariosOpiniones.csv', index = False, header=True)
driver.quit()