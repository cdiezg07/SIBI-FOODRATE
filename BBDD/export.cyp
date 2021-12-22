LOAD CSV WITH HEADERS FROM
'https://raw.githubusercontent.com/cdiezg07/SIBI-FOODRATE/main/nuevoooooMemoria.csv?token=ALKVWTWWJCCLCUCJN2JJIKTBZPJUE' as row
MERGE (r:Receta {id: row.name, link: row.link, foto: row.fotografia, calorias: toFloat(row.calorias), carbohidratos: toFloat(row.carbohidratos), proteina: toFloat(row.proteina), grasa: toFloat(row.grasa), fibra: toFloat(row.fibra), azucares: toFloat(row.azucares), colesterol: toFloat(row.colesterol)})

CREATE INDEX ON:Receta(id);

LOAD CSV WITH HEADERS FROM
  'https://raw.githubusercontent.com/cdiezg07/SIBI-FOODRATE/main/nuevoooooMemoria.csv?token=ALKVWTWWJCCLCUCJN2JJIKTBZPJUE' as row
MERGE (d:Dificultad {id: row.dificultad})

LOAD CSV WITH HEADERS FROM
'https://raw.githubusercontent.com/cdiezg07/SIBI-FOODRATE/main/nuevoooooMemoria.csv?token=ALKVWTWWJCCLCUCJN2JJIKTBZPJUE' AS row
MATCH (r:Receta {id: row.name})
MATCH (d:Dificultad {id: row.dificultad})
MERGE (r)-[:NIVEL_DE]->(d)

LOAD CSV WITH HEADERS FROM
'https://raw.githubusercontent.com/cdiezg07/SIBI-FOODRATE/main/nuevoooooMemoria.csv?token=ALKVWTWWJCCLCUCJN2JJIKTBZPJUE' AS row
MATCH (r:Receta {id: row.name})
MERGE (d:Tiempo {id: toInteger(row.time)})
MERGE (r)-[:TIEMPO_DE]->(d)

LOAD CSV WITH HEADERS 
FROM "https://raw.githubusercontent.com/cdiezg07/SIBI-FOODRATE/main/nuevoooooMemoria.csv?token=ALKVWTWWJCCLCUCJN2JJIKTBZPJUE" AS row
MATCH (r:Receta {id: row.name})
MERGE (i:Ingredientes {value: row.ingredientes})
CREATE (r)-[:CONTIENE_INGREDIENTES]->(i)

LOAD CSV WITH HEADERS FROM
'https://raw.githubusercontent.com/cdiezg07/SIBI-FOODRATE/main/nuevoooooMemoria.csv?token=ALKVWTWWJCCLCUCJN2JJIKTBZPJUE' AS row with row,
split(row.users, ";") AS users
unwind users as user with user, row,
split(user, "|") as rate
merge(u:User {username:rate[0]})
merge(r:Receta {id:row.name})
create(u)-[ra:RATE {star: rate[1]}]->(r) 
