const neo4j = require('neo4j-driver')
var express = require('express')
var app = express();
var path = require('path');
const session = require("express-session");
const dfd = require("danfojs-node")
var spawn = require("child_process").spawn;
var util = require("util");


// const tf = require("@tensorflow/tfjs-node")

//const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "1234"))
const driver = neo4j.driver("neo4j+s://77d8734b.databases.neo4j.io", neo4j.auth.basic("neo4j", "UftvoELA7WGKDs-HsQdlewwMiC-6NVRR4pcuDHzOJc8"))
const neo4jSession = driver.session()

const ejs = require('ejs');
app.set('view engine', 'ejs');

const port = 4444;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//AUTENTICACION
app.use(
    session({
      secret: "siu", //Firma secreta
      resave: false, //No se para que sirve
      saveUninitialized: false, //La sesion no se almacena si está vacia
      cookie: {
        maxAge: (30 * 60 * 1000) //miliseconds
      }
    })
  );

var auth = function(req, res, next) {
if (req.session && req.session.type)
    return next();
else
    return res.sendStatus(401);
};

var userAuth = function (req, res, next) {
    if (req.session) {
      return next();
    } else {
      return res.redirect("/login");
    }
  };

app.use(express.static(__dirname));
app.use("/views", userAuth, express.static(__dirname + "/views"));

async function comprobarCredenciales(req, res){
    let username = req.body.user;
    let password = req.body.password;
    
    const result = await neo4jSession.run('match (u:User {username: $username}) return u.password', {
        username: username
    })

    let passwordNeo4j = result.records[0];
    // console.log(usuario)
        if (!passwordNeo4j) {
          let alerta = {
            text: "Usuario y/o contraseña incorrectos"
          };
        //   res.render(__dirname + "/login/views/login", {
        //     alert: alerta
        //   });
          res.send("Usario o contraseña incorrectos");
        }else{
            
            if(password == passwordNeo4j.get("u.password")){
    
                req.session.user = username;
                req.session.password = passwordNeo4j.get("u.password");
                req.session.type = true;
        
                res.redirect("/recetasUsuario.html");
            }else{
                res.send("Contraseña incorrecta");
            }
        }
}

app.post('/inicioSesion.html', function (req, res) {
    if (!req.body.user || !req.body.password) {
        res.send('login failed');    
    } else {
        comprobarCredenciales(req, res);
    }
});
  

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

//auth,
app.get("/recetasUsuario.html", async (req, res) => {
    records = await obtenerTodasRecetas(req.session.user);
    let dieta = await calcularDieta(req.session.user);
    
    res.render(__dirname + "/views/recetasUsuario", {
        records,
        user: req.session.user,
        dieta
    });
});

async function calcularDieta(user){
    const dieta = await neo4jSession.run('match(u:User) where u.username = "'+user+'" match(u)-[d:DIETA]-(r:Receta) return d, r.id as name');
    return dieta
}

async function obtenerTodasRecetas(user){
    const result = await neo4jSession.run('match(r)-[:TIEMPO_DE]->(t:Tiempo) match(r)-[:NIVEL_DE]->(d:Dificultad) match(r)-[:CONTIENE_INGREDIENTES]->(i:Ingredientes) optional match(u:User {username:"'+user+'"})-[ra:RATE]-(r) return r.id as name, r.foto as foto, r.link as link, r.calorias as calorias, r.proteina as proteina, r.colesterol as colesterol, r.azucares as azucares, r.carbohidratos as carbohidratos, r.fibra as fibra, r.grasa as grasa, collect(i.value) as ingredientes,t.id as tiempo, d.id as dificultad, ra.star as star limit 50');   
    return result.records;
}

app.post("/registro.html", async (req, res) => {
    
    pass1 = req.body.password;
    pass2 = req.body.passwordRepeat;
    
    if (pass1 == pass2){
        //Se puede registrar el usuario 
        
            const result = await neo4jSession.run('MATCH (user:User {username: $username}) RETURN user', {
                    username: req.body.user
                })
            
            console.log(result.records)
            //Si no esta vacio salta el if
            if (result.records != '') {
                    
                    res.send("El usuario ya existe");
            }else {
                const result = await neo4jSession.run('CREATE (user:User {username: $username, password: $password}) RETURN user', {
                 username: req.body.user,
                 password: pass1
                        })

                console.log(result.records[0].get('user'));
                res.send("Usario creado con exito")
             
            }
    }else{
        res.send("Las contraseñas no son iguales")
    }
    
  });

app.get("/rating", async (req, res) => {
    console.log(req.query.name);
    console.log(req.query.star);
    console.log(req.session.user);
    nombre = req.query.name;
    star = parseInt(req.query.star);

    const result = await neo4jSession.run('MATCH (u:User),(r:Receta) where u.username = $user and r.id = $nombre MERGE (u)-[ra:RATE]->(r) SET ra.star = toInteger($star)', 
                        {
                            user: req.session.user,
                            star: star,
                            nombre: nombre
                        });

    return;
});

app.get("/basadoEnContenido", async (req, res) => {
    
    prediccionesRecetas = await contenido(req, res);
    let dieta = await calcularDieta(req.session.user);

    enviar = []

    for(var i=0; i<20; i++){
        var receta = await neo4jSession.run('MATCH (r:Receta) WHERE r.id = "'+prediccionesRecetas[i][0]+'" match(r)-[:TIEMPO_DE]->(t:Tiempo) match(r)-[:NIVEL_DE]->(d:Dificultad) match(r)-[:CONTIENE_INGREDIENTES]->(i:Ingredientes) optional match(u:User {username:"'+req.session.user+'"})-[ra:RATE]-(r) RETURN DISTINCT r.id as name, r.foto as foto, r.link as link, r.calorias as calorias, r.proteina as proteina, r.colesterol as colesterol, r.azucares as azucares, r.carbohidratos as carbohidratos, r.fibra as fibra, r.grasa as grasa, collect(i.value) as ingredientes,t.id as tiempo, d.id as dificultad, ra.star as star');
        enviar.push(receta.records[0])
    }

    res.render(__dirname + "/views/recetasUsuario", {
        user: req.session.user,
        records: enviar,
        dieta
    });
});

async function contenido(req, res){
    // const recetas = await neo4jSession.run('match(u:User)-[:RATE]-(r:Receta) where u.username = "'+req.session.user+'" match(r)-[:CONTIENE_INGREDIENTES]-(i:Ingredientes) match(r)-[:TIEMPO_DE]-(t:Tiempo) match(r)-[:NIVEL_DE]-(d:Dificultad) return  r.id as name,collect(distinct i.value) as ingrediente,t.id, d.id');
    const recetasUser = await neo4jSession.run('match(u:User)-[ra:RATE]-(r:Receta) where u.username = "'+req.session.user+'" return distinct r.id as name, ra.star as valoracion');
    const recetas = await neo4jSession.run('match(r)-[:CONTIENE_INGREDIENTES]-(i:Ingredientes) match(r)-[:TIEMPO_DE]-(t:Tiempo) match(r)-[:NIVEL_DE]-(d:Dificultad) return  r.id as name,collect(distinct i.value) as ingredientes,t.id, d.id,r.calorias as calorias');
    const ingredientesNeo4j = await neo4jSession.run('match(r:Receta)-[:CONTIENE_INGREDIENTES]-(i:Ingredientes) return distinct i.value as ingrediente');

    let informacion = await calculoInfoNutricionalUser(req.session.user);
    let caloriasRestantes = 2000 - informacion.calorias;
    // console.log(caloriasRestantes)

    let arrayRecetas = []
    recetas.records.forEach(record => { // Iterate through records
        arrayRecetas.push(record.get("name")); // Access the name property from the RETURN statement
    });

    let ingredientes = []
    ingredientesNeo4j.records.forEach(record => { // Iterate through records
        ingredientes.push(record.get("ingrediente")); // Access the name property from the RETURN statement
    });

    let tiempo = ['TiempoBajo', 'TiempoMedio', 'TiempoAlto']

    let caracteristicas = []
    caracteristicas = tiempo.concat(["Baja", "Media", "Alta"], ingredientes, ["Calorias"],["Valoracion"]);

    var index = arrayRecetas.concat(["Perfil"])
    var columns = caracteristicas

    var x = new Array(index.length+1);
    for (var i = 0; i < index.length+1; i++) {
        x[i] = new Array(columns.length+1).fill(0);
    }

    for (var i = 0; i < index.length+1; i++) {
        for(var j=0; j < columns.length+1; j++){

            if(i==0 && j==0){
                x[i][j] = 'undefined';
            }else if(i==0 && j!=0){
                x[i][j] = columns[j-1];
            }else if(i!=0 && j==0){
                x[i][j] = index[i-1];
            }
        }
    }

    let ingredientesMenosValor = ["agua", "jugo", "sal", "oregano", "comino", "laurel", "pimienta", "aceite", "tomillo", "perejil", "curry"]

    recetas.records.forEach(function(record, i) { // Iterate through records

        let ingredientes = (record.get("ingredientes"));
        let tiempo = (record.get("t.id"))
        let dificultad = record.get("d.id")
        let caloriasReceta = record.get("calorias");
        //cambio de numero a letra
        if(tiempo<25){
            tiempo = "TiempoBajo"
        }else if(tiempo<=25 && tiempo<=60){
            tiempo = "TiempoMedio"
        }else{
            tiempo = "TiempoAlto"
        }

        for(var j=0; j < columns.length+1; j++){
            
            for(var k=0; k<ingredientes.length; k++){
                if(x[0][j]==ingredientes[k]){
                    if(ingredientesMenosValor.includes(x[0][j])){
                        x[++i][j]=0;
                        i--;
                    }else{
                        x[++i][j]=3;
                        i--;
                    }
                }
            }
            if(x[0][j]==tiempo){
                x[++i][j]=1;
                i--;
            }

            if(x[0][j]==dificultad){
                x[++i][j]=1;
                i--;
            }


            if(caloriasRestantes>1.3*caloriasReceta){
                calorias = 1.2
            }else{
                calorias = 0.8
            }

            if(x[0][j]=="Calorias"){
                x[++i][j]=calorias;
                i--;
            }
        }
    });

    for(var i=1; i<=index.length; i++){
        if(x[i][0]=="Arroz con Brócoli y Queso"){
            console.log("Se localiza en "+i)
        }
    }

    let recetasValoradas = []
    let xCopia = []
    xCopia = JSON.parse(JSON.stringify(x));
    recetasUser.records.forEach(function(record) { // Iterate through records

        let receta = record.get("name");
        let valoracion = record.get("valoracion");
        for(var i=1; i < index.length+1; i++){
            if(x[i][0]==receta){
                recetasValoradas.push(i);
                for(var j=1; j < columns.length+1; j++){
                    if(x[i][j]!=0){
                        if(j!=260){
                            xCopia[i][j] = x[i][j] * parseInt(valoracion);
                        }
                            // }else{
                        //     xCopia[i][j] = x[i][j] * 5;
                        // }
                    }
                    //Todo por 5 sin importar la valoracion del usurario
                }
                x[i][columns.length]=parseInt(valoracion);
            }
        }
    });

    //calculamos la media de cada caracteristica
    for(var j=1; j < columns.length-1; j++){
        let sumatorio = 0;
        let numero = 0;
        for (var i = 0; i < recetasValoradas.length; i++) {
            if(x[recetasValoradas[i]][j]!=0){
                sumatorio += xCopia[recetasValoradas[i]][j]
                numero += 1;
            }
           
        }

        //media aritemetica + frecuencia de aparicion
        if(numero>0){
            if(j>=7){
            
                x[index.length][j] = ((sumatorio/numero)/5)*(numero/recetasValoradas.length)
                
            }else{
                x[index.length][j] = ((sumatorio/numero)/5)*(numero/recetasValoradas.length)
            }
        }
        // console.log(x)
    }

    //calcular la similitud con el coseno
    //posicion y prediccion
    let prediccionesRecetas = [];

    for (var i = 1; i < index.length; i++) {
        let coseno = 0
        let numerador = 0
        let denominador1 = 0
        let denominador2 = 0
        let denominador = 0
        
        if(!recetasValoradas.includes(i)){
            for(var j=1; j < columns.length-1; j++){
                numerador += x[index.length][j]*x[i][j]
                denominador1 += (x[index.length][j]**2)
                denominador2 += (x[i][j]**2)
                
            }
            denominador = Math.sqrt(denominador1) + Math.sqrt(denominador2)
            coseno = (numerador/denominador)*x[i][260];
            prediccionesRecetas.push([x[i][0], coseno]);
        }  
    }
    //mostrar las recetas de mayor a menor puntuacion
    //ordenamos la matriz prediccionesRecetas de mayor a menor
    prediccionesRecetas.sort(sortFunction);
    for(var i = 0; i < prediccionesRecetas.length; i++){
        prediccionesRecetas[i][1] = prediccionesRecetas[i][1]/3.6;
    }
    return prediccionesRecetas;
}

app.get("/filtroColaborativo", async (req, res) => {
    
    recetasOrdenar = await colaborativo(req, res);
    let dieta = await calcularDieta(req.session.user);

    enviar = []

    if(recetasOrdenar.length<20){
        for(var i=0; i<recetasOrdenar.length; i++){
            var receta = await neo4jSession.run('MATCH (r:Receta) WHERE r.id = "'+recetasOrdenar[i][0]+'" match(r)-[:TIEMPO_DE]->(t:Tiempo) match(r)-[:NIVEL_DE]->(d:Dificultad) match(r)-[:CONTIENE_INGREDIENTES]->(i:Ingredientes) optional match(u:User {username:"'+req.session.user+'"})-[ra:RATE]-(r) RETURN DISTINCT r.id as name, r.foto as foto, r.link as link, r.calorias as calorias, r.proteina as proteina, r.colesterol as colesterol, r.azucares as azucares, r.carbohidratos as carbohidratos, r.fibra as fibra, r.grasa as grasa, collect(i.value) as ingredientes,t.id as tiempo, d.id as dificultad, ra.star as star');
            enviar.push(receta.records[0])
        }
    }else{
        for(var i=0; i<20; i++){
            var receta = await neo4jSession.run('MATCH (r:Receta) WHERE r.id = "'+recetasOrdenar[i][0]+'" match(r)-[:TIEMPO_DE]->(t:Tiempo) match(r)-[:NIVEL_DE]->(d:Dificultad) match(r)-[:CONTIENE_INGREDIENTES]->(i:Ingredientes) optional match(u:User {username:"'+req.session.user+'"})-[ra:RATE]-(r) RETURN DISTINCT r.id as name, r.foto as foto, r.link as link, r.calorias as calorias, r.proteina as proteina, r.colesterol as colesterol, r.azucares as azucares, r.carbohidratos as carbohidratos, r.fibra as fibra, r.grasa as grasa, collect(i.value) as ingredientes,t.id as tiempo, d.id as dificultad, ra.star as star');
            enviar.push(receta.records[0])
        }
    }
    
    console.log("lenot")
    res.render(__dirname + "/views/recetasUsuario", {
        dieta,
        user: req.session.user,
        records: enviar
    });
});

async function  colaborativo(req, res){
    const users = await neo4jSession.run('MATCH (u:User) return u.username');
    const recetas = await neo4jSession.run('MATCH (r:Receta) return r.id');
    const relacion = await neo4jSession.run('MATCH (u:User)-[ra:RATE]-(r:Receta) return u.username, ra.star, r.id');

    //Primero la matriz usuariosXrecetas
    // console.log(users.records);
    // console.log(recetas.records);
    let arrayUser = [];
    let arrayRecetas = [];
    users.records.forEach(record => { // Iterate through records
        arrayUser.push(record.get("u.username")); // Access the name property from the RETURN statement

    });
    // console.log(arrayUser);

    recetas.records.forEach(record => { // Iterate through records
        arrayRecetas.push(record.get("r.id")); // Access the name property from the RETURN statement

    });
    // console.log(arrayRecetas);
    
    let index = arrayUser;
    let columns = arrayRecetas

    var x = new Array(index.length+1);
    for (var i = 0; i < index.length+1; i++) {
        x[i] = new Array(columns.length+1).fill(0);
    }

    for (var i = 0; i < index.length+1; i++) {
        for(var j=0; j < columns.length+1; j++){

            if(i==0 && j==0){
                x[i][j] = 'undefined';
            }else if(i==0 && j!=0){
                x[i][j] = columns[j-1];
            }else if(i!=0 && j==0){
                x[i][j] = index[i-1];
            }
        }
    }

    relacion.records.forEach(record => { // Iterate through records
        var columna = 0;
        for (var i = 0; i < index.length+1; i++) {
            //Encontro la fila
            if(x[i][0]==record.get("u.username")){
                fila = i
            }
        }
        for(var j=0; j < columns.length+1; j++){
                
            //Encontro la columna
            if(x[0][j]==record.get("r.id")){
                columna = j;
            }
        }
        x[fila][columna] = parseInt(record.get("ra.star"));
    });    


    //MSD
    //Comprobar que tienen algo en comun
    //Comparar con el usuario actual
    let usuarioActualPosicion = 0;
    for(var i=0; i< index.length+1; i++){
        if(x[i][0]==req.session.user){
            usuarioActualPosicion = i;
        }
    }
    //MSD
    let resultado = new Array(index.length)
    // for (var i = 1; i < index.length+1; i++) {
    //     if(usuarioActualPosicion != i){
    //         let recetasComun = 0;
    //         copia = JSON.parse(JSON.stringify(x));
    //         copia[i].shift()
    //         copia[usuarioActualPosicion].shift()
    //         let max = Math.max(Math.max(...copia[i]), Math.max(...copia[usuarioActualPosicion]));
    //         let min = Math.min(Math.min.apply(null, copia[i].filter(Boolean)), Math.min.apply(null, copia[usuarioActualPosicion].filter(Boolean)));
    //         let sumatorio = 0;
    //         // console.log(max+"  "+ min);
            
    //         for(var j=1; j < columns.length+1; j++){
    //             if(x[i][j]!=0){
    //                 if(x[usuarioActualPosicion][j]!=0){
    //                     recetasComun = recetasComun +1;
    //                     sumatorio = sumatorio + ((x[i][j]-x[usuarioActualPosicion][j])/(max-min))**2
    //                 }
    //             }
    //         }
    //         //formula
    //         if(recetasComun!=0){
    //             resultado[i-1] = (1-(1/recetasComun)*(sumatorio))
    //         }
    //     }
    // }
    // console.log(resultado)

    //Pearson

    var mediaUserActual = 0
    var contadorUserActual = 0
    for(var j=1; j<columns.length+1; j++){
        if(x[usuarioActualPosicion][j]!=0){
            contadorUserActual++;
            mediaUserActual += x[usuarioActualPosicion][j]
        }
    }
    mediaUserActual = mediaUserActual / contadorUserActual

    for (var i = 1; i < index.length+1; i++) {
        if(usuarioActualPosicion != i){
            
            var mediaUsuario = 0
            var contadorUsuario = 0
            for(var j=1; j<columns.length+1; j++){
                if(x[i][j]!=0){
                    contadorUsuario++;
                    mediaUsuario += x[i][j]
                }
            }
            mediaUsuario = mediaUsuario / contadorUsuario
            var numerador = 0
            var denominador1 = 0
            var denominador2 = 0 
            var recetasComun = false
            for(var j=1; j < columns.length+1; j++){
                if(x[i][j]!=0){
                    if(x[usuarioActualPosicion][j]!=0){
                        recetasComun = true
                        numerador += (x[i][j]-mediaUsuario)*(x[usuarioActualPosicion][j]-mediaUserActual) 
                        denominador1 += ((x[i][j]-mediaUsuario)**2)
                        denominador2 += ((x[usuarioActualPosicion][j]-mediaUserActual)**2)
                    }
                }
            }
            //formula
            if(recetasComun){
                var denominador = Math.sqrt(denominador1)*Math.sqrt(denominador2)
                if(denominador!=0){
                    resultado[i-1] = (numerador / denominador)
                }
                    
            }
        }
    }

    similitudes = []
    var contador = 0
    for(let i =0; i<index.length; i++){
        
        // if(resultado[i] != undefined && resultado[i] != 1){
        if(resultado[i] != undefined && resultado[i]!=-1){
            similitudes.push(new Array(1).fill(0));
            similitudes[contador][0] = index[i]
            similitudes[contador][1] = resultado[i]
            contador++
        }
        
    }

    if(resultado.every(item => item === 0)){
        res.send("No hay relaciones con las demas personas");
        return;
    }
    // console.log(similitudes)
    similitudes.sort(sortFunction);
    // console.log(similitudes)

    //MEDIA PONDERADA
    mediaItems = []
    items = []
    recetasValoradas = []
    
    relacion.records.forEach(record => { // Iterate through records
        if(req.session.user==record.get("u.username")){
            for(var j=0; j < columns.length+1; j++){   
                //Encontro la columna
                if(x[0][j]==record.get("r.id")){
                    recetasValoradas.push(j);
                }
            }
        }
        
    });    

    for(var j=1; j<columns.length+1; j++){
        //Tiene que ser mayor o igual que 3
        var recetasValoradasSimilitud = 0
        var sumatorio = 0;
        var denominador = 0;
        if(!recetasValoradas.includes(j)){
            for(var i=1; i<index.length+1; i++){
        
                if(exists(similitudes, x[i][0])){
                    if(x[i][j] != 0){
                        let posicion = indexOf2dArray(similitudes, x[i][0]);
                        fila = posicion[0]
                        recetasValoradasSimilitud += 1
                        
                        // OldRange = (1 - (-0))  
                        // NewRange = (1 - 0)  
                        // NewValue = (((similitudes[fila][1] - (-0)) * NewRange) / OldRange) + 0
                        OldRange = (1 - (-1))  
                        NewRange = (1 - 0)  
                        NewValue = (((similitudes[fila][1] - (-1)) * NewRange) / OldRange) + 0

                        sumatorio += (x[i][j]*NewValue)
                        denominador += NewValue
                    }
                } 
            }
            if(recetasValoradasSimilitud>=2){
                mediaItems.push(sumatorio/denominador)
                items.push(j)
            }
        }
    }
    
    recetasOrdenar = Array.from(Array(items.length), () => new Array(2));
    for(var i=0; i<items.length; i++){
        recetasOrdenar[i][0] = x[0][items[i]];
        recetasOrdenar[i][1] = mediaItems[i];
    }
    
    recetasOrdenar.sort(sortFunction);
    console.log(recetasOrdenar)
    return recetasOrdenar;
}

function indexOf2dArray(array2d, itemtofind) {
    index = [].concat.apply([], ([].concat.apply([], array2d))).indexOf(itemtofind);
                
    // return "false" if the item is not found
    if (index === -1) { return false; }
    
    // Use any row to get the rows' array length
    // Note, this assumes the rows are arrays of the same length
    numColumns = array2d[0].length;
    
    // row = the index in the 1d array divided by the row length (number of columns)
    row = parseInt(index / numColumns);
    
    // col = index modulus the number of columns
    col = index % numColumns;
    
    return [row, col]; 
}

function exists(arr, search) {
    return arr.some(row => row.includes(search));
}

function sortFunction(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] > b[1]) ? -1 : 1;
    }
}

function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
      if (arr[i] === value) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
  }


app.get("/hibrido", async (req, res) => {

    const recetas = await neo4jSession.run('MATCH (r:Receta) return r.id');
    prediccionesColaborativo = await colaborativo(req, res);
    prediccionesContenido = await contenido(req, res);
    let dieta = await calcularDieta(req.session.user);

    for(let i=0; i<prediccionesColaborativo.length; i++){
        prediccionesColaborativo[i][1] = prediccionesColaborativo[i][1]/5;
    }
    console.log(prediccionesColaborativo)
    console.log(prediccionesContenido)

    x = []
    let encontrado = false
    j=0

    recetas.records.forEach(record => { // Iterate through records
       
        if(exists(prediccionesColaborativo,record.get("r.id")) && exists(prediccionesContenido, record.get("r.id"))){
            let posicionCol = indexOf2dArray(prediccionesColaborativo, record.get("r.id"))
            let posicionConten = indexOf2dArray(prediccionesContenido, record.get("r.id"))
            sumaPon = 0.8*prediccionesContenido[posicionConten[0]][1]+0.2*prediccionesColaborativo[posicionCol[0]][1]
            x.push(prediccionesContenido[posicionConten[0]].concat(prediccionesColaborativo[posicionCol[0]][1], [sumaPon]))
        }
        
        if(exists(prediccionesColaborativo,record.get("r.id"))==false && exists(prediccionesContenido, record.get("r.id"))==true){
            let posicionConten = indexOf2dArray(prediccionesContenido, record.get("r.id"))
            sumaPon = 0.8*prediccionesContenido[posicionConten[0]][1]+0.2*0
            x.push(prediccionesContenido[posicionConten[0]].concat([0], [sumaPon]))
        }
        if(exists(prediccionesColaborativo,record.get("r.id"))==true && exists(prediccionesContenido, record.get("r.id"))==false){
            let posicionCol = indexOf2dArray(prediccionesColaborativo, record.get("r.id"))
            sumaPon = 0.8*0+0.2*prediccionesColaborativo[posicionCol[0]][1]
            x.push([prediccionesColaborativo[posicionCol[0]][0]].concat([0], prediccionesColaborativo[posicionCol[0]][1], [sumaPon]))
        }

    });
    


    x.sort(function (element_a, element_b) {
        return element_a[3] - element_b[3];
    });
    var reversed = x.reverse()
    console.log(reversed)
    enviar = []

    for(var i=0; i<20; i++){
        var receta = await neo4jSession.run('MATCH (r:Receta) WHERE r.id = "'+reversed[i][0]+'" match(r)-[:TIEMPO_DE]->(t:Tiempo) match(r)-[:NIVEL_DE]->(d:Dificultad) match(r)-[:CONTIENE_INGREDIENTES]->(i:Ingredientes) optional match(u:User {username:"'+req.session.user+'"})-[ra:RATE]-(r) RETURN DISTINCT r.id as name, r.foto as foto, r.link as link, r.calorias as calorias, r.proteina as proteina, r.colesterol as colesterol, r.azucares as azucares, r.carbohidratos as carbohidratos, r.fibra as fibra, r.grasa as grasa, collect(i.value) as ingredientes,t.id as tiempo, d.id as dificultad, ra.star as star');
        enviar.push(receta.records[0])
    }

    res.render(__dirname + "/views/recetasUsuario", {
        user: req.session.user,
        records: enviar, 
        dieta
    });
});

app.get("/misGustos", async (req, res) => {
    console.log(req.session.user);

    const result = await neo4jSession.run('match(u:User)-[ra:RATE]-(r:Receta) where u.username=$user match(r)-[:TIEMPO_DE]->(t:Tiempo) match(r)-[:NIVEL_DE]->(d:Dificultad) match(r)-[:CONTIENE_INGREDIENTES]->(i:Ingredientes) return DISTINCT r.id as name, r.foto as foto, r.link as link, r.calorias as calorias, r.proteina as proteina, r.colesterol as colesterol, r.azucares as azucares, r.carbohidratos as carbohidratos, r.fibra as fibra, r.grasa as grasa, collect(i.value) as ingredientes,t.id as tiempo, d.id as dificultad, ra.star as star', 
                        {
                            user: req.session.user,
                        });
    let dieta = await calcularDieta(req.session.user);

    res.render(__dirname + "/views/misGustos", {
        records: result.records,
        user: req.session.user,
        dieta
    });

});

app.post("/vamos", async (req, res) => {
    console.log(req.body);
    palabraClave = req.body.busqueda;
    numero = parseInt(req.body.tiempoTexto);
    tiempo = req.body.tiempo;
    dificultad = req.body.dificultad;
    minCalorias = req.body.minCalorias;
    maxCalorias = req.body.maxCalorias;
    minCarbohidratos = req.body.minCarbohidratos;
    maxCarbohidratos = req.body.maxCarbohidratos;
    minProteinas = req.body.minProteinas;
    maxProteinas = req.body.maxProteinas;
    minGrasas = req.body.minGrasas;
    maxGrasas = req.body.maxGrasas;
    minFibra = req.body.minFibra;
    maxFibra = req.body.maxFibra;
    minAzucares = req.body.minAzucares;
    maxAzucares = req.body.maxAzucares;
    minColesterol = req.body.minColesterol;
    maxColesterol = req.body.maxColesterol;
    let user = req.session.user
    let dieta = await calcularDieta(req.session.user);


    if(tiempo=="cualquiera" && dificultad=="cualquiera"){
        const result = await neo4jSession.run('match(r:Receta)-[:CONTIENE_INGREDIENTES]->(ii:Ingredientes) where toLower(r.id) contains $palabra or toLower(ii.value) contains $palabra match(r)-[:TIEMPO_DE]->(t:Tiempo) match(r)-[:NIVEL_DE]->(d:Dificultad) match(r)-[:CONTIENE_INGREDIENTES]->(i:Ingredientes) where '+minCalorias+'<r.calorias<'+maxCalorias+' and '+minProteinas+'<r.proteina<'+maxProteinas+' and '+minCarbohidratos+'<r.carbohidratos<'+maxCarbohidratos+' and '+minGrasas+'<r.grasa<'+maxGrasas+' and '+minAzucares+'<r.azucares<'+maxAzucares+' and '+minColesterol+'<r.colesterol<'+maxColesterol+' and '+minFibra+'<r.fibra<'+maxFibra+' optional match(u:User {username:"'+user+'"})-[ra:RATE]-(r) return DISTINCT r.id as name, r.foto as foto, r.link as link, r.calorias as calorias, r.proteina as proteina, r.colesterol as colesterol, r.azucares as azucares, r.carbohidratos as carbohidratos, r.fibra as fibra, r.grasa as grasa, collect(distinct i.value) as ingredientes, t.id as tiempo, d.id as dificultad, ra.star as star limit 50', 
                        {
                            palabra: palabraClave,
                        });

        //console.log(result.records)
        res.render(__dirname + "/views/recetasUsuario", {
            records: result.records,
            user: req.session.user,
            dieta
        });

    }else if(tiempo=="cualquiera" && dificultad!="cualquiera"){
        const result = await neo4jSession.run('match(r:Receta)-[:CONTIENE_INGREDIENTES]->(ii:Ingredientes) where toLower(r.id) contains $palabra or toLower(ii.value) contains $palabra match(r)-[:TIEMPO_DE]->(t:Tiempo) match(r)-[:NIVEL_DE]->(d:Dificultad) match(r)-[:CONTIENE_INGREDIENTES]->(i:Ingredientes) where d.id = $dificultad and '+minCalorias+'<r.calorias<'+maxCalorias+' and '+minProteinas+'<r.proteina<'+maxProteinas+' and '+minCarbohidratos+'<r.carbohidratos<'+maxCarbohidratos+' and '+minGrasas+'<r.grasa<'+maxGrasas+' and '+minAzucares+'<r.azucares<'+maxAzucares+' and '+minColesterol+'<r.colesterol<'+maxColesterol+' and '+minFibra+'<r.fibra<'+maxFibra+' optional match(u:User {username:"'+user+'"})-[ra:RATE]-(r) return DISTINCT r.id as name, r.foto as foto, r.link as link, r.calorias as calorias, r.proteina as proteina, r.colesterol as colesterol, r.azucares as azucares, r.carbohidratos as carbohidratos, r.fibra as fibra, r.grasa as grasa, collect(distinct i.value) as ingredientes, t.id as tiempo, d.id as dificultad, ra.star as star limit 50', 
                        {
                            palabra: palabraClave,
                            dificultad: req.body.dificultad
                        });
        console.log(result.records)
        res.render(__dirname + "/views/recetasUsuario", {
            records: result.records,
            user: req.session.user,
            dieta
        });
    }else if(tiempo!="cualquiera" && dificultad=="cualquiera"){
        const result = await neo4jSession.run('match(r:Receta)-[:CONTIENE_INGREDIENTES]->(ii:Ingredientes) where toLower(r.id) contains $palabra or toLower(ii.value) contains $palabra match(r)-[:TIEMPO_DE]->(t:Tiempo) match(r)-[:CONTIENE_INGREDIENTES]->(i:Ingredientes) where t.id '+tiempo+' $tiempoTexto and '+minCalorias+'<r.calorias<'+maxCalorias+' and '+minProteinas+'<r.proteina<'+maxProteinas+' and '+minCarbohidratos+'<r.carbohidratos<'+maxCarbohidratos+' and '+minGrasas+'<r.grasa<'+maxGrasas+' and '+minAzucares+'<r.azucares<'+maxAzucares+' and '+minColesterol+'<r.colesterol<'+maxColesterol+' and '+minFibra+'<r.fibra<'+maxFibra+' match(r)-[:NIVEL_DE]->(d:Dificultad) optional match(u:User {username:"'+user+'"})-[ra:RATE]-(r) return DISTINCT r.id as name, r.foto as foto, r.link as link, r.calorias as calorias, r.proteina as proteina, r.colesterol as colesterol, r.azucares as azucares, r.carbohidratos as carbohidratos, r.fibra as fibra, r.grasa as grasa, collect(distinct i.value) as ingredientes, t.id as tiempo, d.id as dificultad, ra.star as star limit 50', 
                        {
                            palabra: palabraClave,
                            tiempoTexto: numero,
                        });

        console.log(result.records)
        res.render(__dirname + "/views/recetasUsuario", {
            records: result.records,
            user: req.session.user,
            dieta
        });
    }else if(tiempo!="cualquiera" && dificultad!="cualquiera"){
        const result = await neo4jSession.run('match(r:Receta)-[:CONTIENE_INGREDIENTES]->(ii:Ingredientes) where toLower(r.id) contains $palabra or toLower(ii.value) contains $palabra match(r)-[:TIEMPO_DE]->(t:Tiempo) match(r)-[:CONTIENE_INGREDIENTES]->(i:Ingredientes) match(r)-[:NIVEL_DE]->(d:Dificultad) where t.id '+tiempo+' $tiempoTexto and d.id="'+dificultad+'" and '+minCalorias+'<r.calorias<'+maxCalorias+' and '+minProteinas+'<r.proteina<'+maxProteinas+' and '+minCarbohidratos+'<r.carbohidratos<'+maxCarbohidratos+' and '+minGrasas+'<r.grasa<'+maxGrasas+' and '+minAzucares+'<r.azucares<'+maxAzucares+' and '+minColesterol+'<r.colesterol<'+maxColesterol+' and '+minFibra+'<r.fibra<'+maxFibra+' optional match(u:User {username:"'+user+'"})-[ra:RATE]-(r) return DISTINCT r.id as name, r.foto as foto, r.link as link, r.calorias as calorias, r.proteina as proteina, r.colesterol as colesterol, r.azucares as azucares, r.carbohidratos as carbohidratos, r.fibra as fibra, r.grasa as grasa, collect(distinct i.value) as ingredientes, t.id as tiempo, d.id as dificultad, ra.star as star limit 50', 
                        {
                            palabra: palabraClave,
                            tiempoTexto: numero,
                            dificultad: req.body.dificultad
                        });
        console.log(result.records)
        res.render(__dirname + "/views/recetasUsuario", {
            records: result.records,
            user: req.session.user,
            dieta
        });
    }

    
});

app.post("/dieta", async (req, res) => {
    console.log(req.body);

    for(let j=0; j<req.body.length; j++){

        if(req.body[j][1]=="add"){
            
            const result = await neo4jSession.run('match(u:User), (r:Receta) where u.username = "'+req.session.user+'" and r.id= "'+req.body[j][0]+'" MERGE(u)-[:DIETA]-(r)');
            
        }else{
            const result = await neo4jSession.run('match(u:User) where u.username = "'+req.session.user+'" match(u)-[d:DIETA]-(r:Receta {id:"'+req.body[j][0]+'"}) delete d');
        }
    }
    return;
});

app.get("/perfil", async (req, res) => {
    
    let informacion = await calculoInfoNutricionalUser(req.session.user);

    let calorias = informacion.calorias;
    let proteinas = informacion.proteinas
    let carbohidratos = informacion.carbohidratos
    let grasas = informacion.grasas
    let fibra = informacion.fibra
    let azucares = informacion.azucares
    let colesterol= informacion.colesterol

    res.render(__dirname + "/views/Perfil", {
        user: req.session.user,
        calorias,
        proteinas,
        carbohidratos: Math.round(carbohidratos),
        grasas,
        fibra,
        azucares,
        colesterol,
    });
});

async function calculoInfoNutricionalUser(usuario){
    const result = await neo4jSession.run('match(u:User) where u.username = "'+usuario+'" match(u)-[d:DIETA]-(r:Receta) return r.calorias as calorias, r.proteina as proteina, r.colesterol as colesterol, r.azucares as azucares, r.carbohidratos as carbohidratos, r.fibra as fibra, r.grasa as grasa');

    let calorias = 0
    let proteinas = 0
    let carbohidratos = 0
    let grasas = 0
    let fibra = 0
    let azucares = 0
    let colesterol = 0

    result.records.forEach(record => { // Iterate through records
        calorias += record.get("calorias"); // Access the name property from the RETURN statement
        proteinas += record.get("proteina");
        carbohidratos += record.get("carbohidratos");
        grasas += record.get("grasa");
        fibra += record.get("fibra");
        azucares += record.get("azucares");
        colesterol += record.get("colesterol");
        
     });

     return {
        calorias,
        proteinas,
        carbohidratos,
        grasas,
        fibra,
        azucares,
        colesterol,
     }
}


app.listen(port, () => {
    console.log(`Running ${port}`);
  });



