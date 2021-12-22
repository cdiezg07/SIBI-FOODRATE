import pandas as pd

pd.set_option('display.max_columns', None)
nuevo = pd.read_csv('./nuevooooo.csv')

nuevo = nuevo.drop(nuevo[(nuevo.ingredientes == "taza") | (nuevo.ingredientes == "las") | (nuevo.ingredientes == "g")
        | (nuevo.ingredientes == "La") | (nuevo.ingredientes == "la") | (nuevo.ingredientes == "su") | (nuevo.ingredientes == "de")
        | (nuevo.ingredientes == "3") | (nuevo.ingredientes == "codo") | (nuevo.ingredientes == "mm") | (nuevo.ingredientes == "tu")
        | (nuevo.ingredientes == "L") | (nuevo.ingredientes == "I") | (nuevo.ingredientes == "1") | (nuevo.ingredientes == "2")
        | (nuevo.ingredientes == "y") | (nuevo.ingredientes == "una") | (nuevo.ingredientes == "mas") | (nuevo.ingredientes == "cara") | (nuevo.ingredientes == "a")
        | (nuevo.ingredientes == "gr") | (nuevo.ingredientes == "ate") | (nuevo.ingredientes == "los") | (nuevo.ingredientes == "Mi") | (nuevo.ingredientes == "al")
        | (nuevo.ingredientes == "porciones") | (nuevo.ingredientes == "brillo") | (nuevo.ingredientes == "un") | (nuevo.ingredientes == "dia")
        | (nuevo.ingredientes == "pierna") | (nuevo.ingredientes == "hierba") | (nuevo.ingredientes == "olla") | (nuevo.ingredientes == "ljquid")
        | (nuevo.ingredientes == "molde") | (nuevo.ingredientes == "lino") | (nuevo.ingredientes == "cola") | (nuevo.ingredientes == "tuna") | (nuevo.ingredientes == "para")
        | (nuevo.ingredientes == "sobre") | (nuevo.ingredientes == "diente") | (nuevo.ingredientes == "cascara") | (nuevo.ingredientes == "raja")
        | (nuevo.ingredientes == "mini") | (nuevo.ingredientes == "choco") | (nuevo.ingredientes == "pata") | (nuevo.ingredientes == "partes")
        | (nuevo.ingredientes == "bote") | (nuevo.ingredientes == "castilla") | (nuevo.ingredientes == "cabeza") | (nuevo.ingredientes == "lata") 
        | (nuevo.ingredientes == "muslo") | (nuevo.ingredientes == "mesa") | (nuevo.ingredientes == "el") | (nuevo.ingredientes == "mi") 
        | (nuevo.ingredientes == "l") | (nuevo.ingredientes == "i") | (nuevo.ingredientes == "oli") | (nuevo.ingredientes == "oz")
        | (nuevo.ingredientes == "arm") | (nuevo.ingredientes == "mar") | (nuevo.ingredientes == "flor") | (nuevo.ingredientes == "red")
        | (nuevo.ingredientes == "refresco") | (nuevo.ingredientes == "jugo") | (nuevo.ingredientes == "salsa") | (nuevo.ingredientes == "oliva") 
        | (nuevo.ingredientes == "caldo") | (nuevo.ingredientes == "polvo") | (nuevo.ingredientes == "masa") | (nuevo.ingredientes == "germen")
        | (nuevo.ingredientes == "barra") | (nuevo.ingredientes == "corte") | (nuevo.ingredientes == "kit") | (nuevo.ingredientes == "corazon")
        | (nuevo.ingredientes == "cubito") | (nuevo.ingredientes == "pastel") | (nuevo.ingredientes == "balsamico") | (nuevo.ingredientes == "barrita")
        | (nuevo.ingredientes == "vegetal") | (nuevo.ingredientes == "bombon") | (nuevo.ingredientes == "liquido") | (nuevo.ingredientes == "rosa")
        | (nuevo.ingredientes == "pica") | (nuevo.ingredientes == "botella") | (nuevo.ingredientes == "tallo") | (nuevo.ingredientes == "bebida")
        | (nuevo.ingredientes == "chicle") | (nuevo.ingredientes == "palma") | (nuevo.ingredientes == "lengua")].index)
        #pechuga se va a la mierda, no aporta nada
# | (nuevo.ingredientes == "semilla")

#semilla, grano(elote), girasol, salvado-> salvado de trigo, clara->clara de huevo, cabra, dulce->dulce de leche, fruto->fruto rojo
print(nuevo['ingredientes'].unique())
print(nuevo.isnull().sum())
print("\n")
nuevo["calorias"] = pd.to_numeric(nuevo["calorias"])
# print(nuevo.calorias.dtype)

# print(nuevo.head(17))

receta = []
ingrediente = []

i = 0
while i < nuevo.shape[0]:
        # print(nuevo.loc[i,"name"])
        if(nuevo.loc[i,"name"] in receta):
                if(nuevo.loc[i,"ingredientes"] in ingrediente):
                        nuevo = nuevo.drop(nuevo.index[i])
                        nuevo.reset_index(drop=True, inplace=True)
                        #print(nuevo.head(17))
                        i = i - 1
                else:
                        ingrediente.append(nuevo.loc[i, "ingredientes"])
        else:
                
                receta.append(nuevo.loc[i,"name"])
                ingrediente = []
                ingrediente.append(nuevo.loc[i, "ingredientes"])
                #print(ingrediente)
        i = i + 1

#leche/vaca a leche
i = 0
receta = []
leche = []

while i < nuevo.shape[0]:
        # print(nuevo.loc[i,"name"])
        if(nuevo.loc[i,"name"] in receta):
                if(nuevo.loc[i, "ingredientes"]=="leche"):
                        leche.append(nuevo.loc[i, "ingredientes"])

                if(len(leche)!=0):
                        if(nuevo.loc[i, "ingredientes"]=="vaca"):
                                
                                nuevo = nuevo.drop(nuevo.index[i])
                                nuevo.reset_index(drop=True, inplace=True)
                                #print(nuevo.head(17))
                                i = i - 1
                
        else:
                
                receta.append(nuevo.loc[i,"name"])
                leche = []
                if(nuevo.loc[i, "ingredientes"]=="leche"):
                        leche.append(nuevo.loc[i, "ingredientes"])
                #print(ingrediente)
        i = i + 1

i = 0
receta = []
clara = []

while i < nuevo.shape[0]:
        # print(nuevo.loc[i,"name"])
        if(nuevo.loc[i,"name"] in receta):
                if(nuevo.loc[i, "ingredientes"]=="clara"):
                        clara.append(nuevo.loc[i, "ingredientes"])
                        posicionFila = i

                if(len(clara)!=0):
                        if(nuevo.loc[i, "ingredientes"]=="huevo"):
                                nuevo.loc[posicionFila, "ingredientes"] = "clara de huevo"
                                nuevo = nuevo.drop(nuevo.index[i])
                                nuevo.reset_index(drop=True, inplace=True)
                                #print(nuevo.head(17))
                                i = i - 1
                
        else:
                
                receta.append(nuevo.loc[i,"name"])
                clara = []
                if(nuevo.loc[i, "ingredientes"]=="clara"):
                        clara.append(nuevo.loc[i, "ingredientes"])
                        posicionFila = i
                #print(ingrediente)
        i = i + 1

i = 0
receta = []
semilla = []

while i < nuevo.shape[0]:
        # print(nuevo.loc[i,"name"])
        if(nuevo.loc[i,"name"] in receta):
                if(nuevo.loc[i, "ingredientes"]=="semilla"):
                        semilla.append(nuevo.loc[i, "ingredientes"])
                        posicionFila = i

                if(len(semilla)!=0):
                        if(nuevo.loc[i, "ingredientes"]=="girasol"):
                                nuevo.loc[posicionFila, "ingredientes"] = "semilla de girasol"
                                nuevo = nuevo.drop(nuevo.index[i])
                                nuevo.reset_index(drop=True, inplace=True)
                                #print(nuevo.head(17))
                                i = i - 1
                
        else:
                
                receta.append(nuevo.loc[i,"name"])
                semilla = []
                if(nuevo.loc[i, "ingredientes"]=="semilla"):
                        semilla.append(nuevo.loc[i, "ingredientes"])
                        posicionFila = i
                #print(ingrediente)
        i = i + 1


i = 0
receta = []
grano = []

while i < nuevo.shape[0]:
        # print(nuevo.loc[i,"name"])
        if(nuevo.loc[i,"name"] in receta):
                if(nuevo.loc[i, "ingredientes"]=="grano"):
                        if("elote" in nuevo.loc[i,"name"].lower() or "ensalada" in nuevo.loc[i,"name"].lower()):
                                nuevo.loc[i, "ingredientes"] = "grano de elote"
                        else:
                                nuevo = nuevo.drop(nuevo.index[i])
                                nuevo.reset_index(drop=True, inplace=True)
                                i = i - 1
                
        else:
                
                receta.append(nuevo.loc[i,"name"])
                grano = []
                if(nuevo.loc[i, "ingredientes"]=="grano"):
                        if("elote" in nuevo.loc[i,"name"].lower() or "ensalada" in nuevo.loc[i,"name"].lower()):
                                nuevo.loc[i, "ingredientes"] = "grano de elote"
                        else:
                                nuevo = nuevo.drop(nuevo.index[i])
                                nuevo.reset_index(drop=True, inplace=True)
                                i = i - 1
        i = i + 1


i = 0
receta = []
queso = []

while i < nuevo.shape[0]:
        # print(nuevo.loc[i,"name"])
        if(nuevo.loc[i,"name"] in receta):
                if(nuevo.loc[i, "ingredientes"]=="queso"):
                        queso.append(nuevo.loc[i, "ingredientes"])
                        posicionFila = i

                if(len(queso)!=0):
                        if(nuevo.loc[i, "ingredientes"]=="cabra"):
                                nuevo.loc[posicionFila, "ingredientes"] = "queso de cabra"
                                nuevo = nuevo.drop(nuevo.index[i])
                                nuevo.reset_index(drop=True, inplace=True)
                                #print(nuevo.head(17))
                                i = i - 1
                
        else:
                
                receta.append(nuevo.loc[i,"name"])
                queso = []
                if(nuevo.loc[i, "ingredientes"]=="queso"):
                        queso.append(nuevo.loc[i, "ingredientes"])
                        posicionFila = i
        i = i + 1

nuevo.to_csv(r'D:/Bussiness intelligence/nuevooooo.csv', index = False, header=True)
