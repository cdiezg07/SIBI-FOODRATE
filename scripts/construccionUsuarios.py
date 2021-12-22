import pandas as pd
import names
import random

# pd.set_option('display.max_columns', 15)
nuevo = pd.read_csv("nuevoooooUsersRate.csv")

print(nuevo.head())

#generacion usuarios distintos
users = []
for i in range(28):
        users.append(names.get_first_name())
        
print(users)

    
receta = []
ingrediente = []

i = 0
while i < nuevo.shape[0]:
        # print(nuevo.loc[i,"name"])
        if(nuevo.loc[i,"name"] in receta):
                if(nuevo.loc[i,"ingredientes"] in ingrediente):
                        pass
                else:
                        ingrediente.append(nuevo.loc[i, "ingredientes"])
        else:
                
                receta.append(nuevo.loc[i,"name"])
                
                if(len(ingrediente)!=0):
                    cadena = ""
                    suma = 0
                    puesto = False
                    #10% de los usuarios le gusta la leche y el queso
                    for j in range(int(0.1*len(users))):
                        if("leche" in ingrediente and "queso" in ingrediente):

                            if(j==int(0.1*len(users))-1):
                                cadena += users[j]+"|"+str(random.randint(4,5))
                            else:
                                cadena += users[j]+"|"+str(random.randint(4,5))+";"
                        if("licor" in ingrediente or ("col" in ingrediente and "ensalada" in ingrediente)):

                            if(j==int(0.1*len(users))-1):
                                cadena += users[j]+"|"+str(random.randint(1,2))
                            else:
                                cadena += users[j]+"|"+str(random.randint(1,2))+";"

                    suma = int(0.1*len(users))
                    j = j+1

                    while j<suma+int(0.1*len(users)):
                        if("jamon" in ingrediente or "salmon" in ingrediente or "papa" in ingrediente):
                            if(not pd.isnull(nuevo.loc[posicionReceta, 'users']) and not(puesto)):
                                cadena += ";"
                                puesto = True
                            if(j==suma + int(0.1*len(users))-1):
                                cadena += users[j]+"|"+str(random.randint(4,5))
                            else:
                                cadena += users[j]+"|"+str(random.randint(4,5))+";"
                        j = j + 1
                    suma += int(0.1*len(users))
                    puesto = False

                    while j<suma+int(0.1*len(users)):
                        if("pera" in ingrediente or "ensalada" in ingrediente or "cafe" in ingrediente):
                            if(not pd.isnull(nuevo.loc[posicionReceta, 'users']) and not(puesto)):
                                cadena += ";"
                                puesto = True
                            if(j==suma + int(0.1*len(users))-1):
                                cadena += users[j]+"|"+str(random.randint(4,5))
                            else:
                                cadena += users[j]+"|"+str(random.randint(4,5))+";"
                        j = j + 1
                    suma += int(0.1*len(users))
                    puesto = False

                    while j<suma+int(0.1*len(users)):
                        if("carne" in ingrediente or "queso" in ingrediente or "huevo" in ingrediente):
                            if(not pd.isnull(nuevo.loc[posicionReceta, 'users']) and not(puesto)):
                                # print(nuevo.loc[posicionReceta, 'users'])
                                cadena += ";"
                                puesto = True
                            if(j==suma + int(0.1*len(users))-1):
                                cadena += users[j]+"|"+str(random.randint(4,5))
                            else:
                                cadena += users[j]+"|"+str(random.randint(4,5))+";"
                        j = j + 1
                    suma += int(0.1*len(users))
                    puesto = False


                    while j<suma+int(0.1*len(users)):
                        if("pulpo" in ingrediente and "camaron" in ingrediente):
                            if(not pd.isnull(nuevo.loc[posicionReceta, 'users']) and not(puesto)):
                                cadena += ";"
                                puesto = True
                            if(j==suma + int(0.1*len(users))-1):
                                cadena += users[j]+"|"+str(random.randint(4,5))
                            else:
                                cadena += users[j]+"|"+str(random.randint(4,5))+";"
                        j = j + 1
                    suma += int(0.1*len(users))
                    puesto = False

                    while j<suma+int(0.2*len(users)):
                        if("maiz" in ingrediente or "pechuga" in ingrediente):
                            if(not pd.isnull(nuevo.loc[posicionReceta, 'users']) and not(puesto)):
                                cadena += ";"
                                puesto = True
                            if(j==suma + int(0.2*len(users))-1):
                                cadena += users[j]+"|"+str(random.randint(4,5))
                            else:
                                cadena += users[j]+"|"+str(random.randint(4,5))+";"
                        j = j + 1
                    suma += int(0.2*len(users))
                    puesto = False

                    while j< suma + int(0.3*len(users)):
                        if(("papa" in ingrediente and "costilla" in ingrediente) or ("pollo" in ingrediente and "arroz" in ingrediente)):
                            if(not pd.isnull(nuevo.loc[posicionReceta, 'users']) and not(puesto)):
                                cadena += ";"
                                puesto = True
                            if(j==suma + int(0.3*len(users))-1):
                                cadena += users[j]+"|"+str(random.randint(4,5))
                            else:
                                cadena += users[j]+"|"+str(random.randint(4,5))+";"
                        j = j + 1
                    nuevo.loc[posicionReceta, 'users'] = cadena

                posicionReceta = i
                ingrediente = []
                ingrediente.append(nuevo.loc[i, "ingredientes"])
                #print(ingrediente)
        i = i + 1

print(nuevo.head())

nuevo.to_csv(r'D:/Bussiness intelligence/Construccion usuarios/nuevoooooMemoria.csv', index = False, header=True)
