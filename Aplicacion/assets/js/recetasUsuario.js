function buscar(){
  tiempo = document.getElementById("tiempo").value;
  tiempoTexto = document.getElementById("tiempoTexto").value;
  dificultad = document.getElementById("dificultad").value;
  busqueda = document.getElementById("busqueda").value;
  minCalorias = document.getElementById("minCalorias").value;
  maxCalorias = document.getElementById("maxCalorias").value;
  minCarbohidratos = document.getElementById("minCarbohidratos").value;
  maxCarbohidratos = document.getElementById("maxCarbohidratos").value;
  minProteinas = document.getElementById("minProteinas").value;
  maxProteinas = document.getElementById("maxProteinas").value;
  minGrasas = document.getElementById("minGrasas").value;
  maxGrasas = document.getElementById("maxGrasas").value;
  minFibra = document.getElementById("minFibra").value;
  maxFibra = document.getElementById("maxFibra").value;
  minAzucares = document.getElementById("minAzucares").value;
  maxAzucares = document.getElementById("maxAzucares").value;
  minColesterol = document.getElementById("minColesterol").value;
  maxColesterol = document.getElementById("maxColesterol").value;
  
  let data = {
      tiempo: tiempo,
      tiempoTexto: tiempoTexto,
      dificultad: dificultad,
      busqueda: busqueda,
      minCalorias : minCalorias,
      maxCalorias: maxCalorias,
      minCarbohidratos: minCarbohidratos,
      maxCarbohidratos: maxCarbohidratos,
      minProteinas: minProteinas,
      maxProteinas: maxProteinas,
      minGrasas: minGrasas,
      maxGrasas: maxGrasas,
      minFibra: minFibra,
      maxFibra: maxFibra,
      minAzucares: minAzucares,
      maxAzucares: maxAzucares,
      minColesterol: minColesterol,
      maxColesterol: maxColesterol
  }
    
      fetch("/vamos", {
      method: "POST", 
      body: JSON.stringify(data),
      headers:{
        'Content-Type': 'application/json'   //Importante para que le llegue al servidor
      }
        }).then(res => {
          return res.text();
        }).then((html) => {
          document.body.innerHTML = html 
          expander();
        });
}

function expander(){
  var coll = document.getElementsByClassName("collapsible");
  var i;
  
  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.maxHeight){
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      } 
    });
  } 
}

function colaborativo(){
    fetch("/filtroColaborativo", {
      method: "GET", 
        }).then(res => {
          return res.text();
        }).then((html) => {
          document.body.innerHTML = html 
          expander();
        });
}

function contenido(){
    fetch("/basadoEnContenido", {
      method: "GET", 
        }).then(res => {
          return res.text();
        }).then((html) => {
          document.body.innerHTML = html 
          expander();
        });
}

function hibrido(){
    fetch("/hibrido", {
      method: "GET", 
        }).then(res => {
          return res.text();
        }).then((html) => {
          document.body.innerHTML = html 
          expander();
        });
}

function masRecetas(){
    console.log("mas recetas 30")
}

function change(value) {
    console.log(value)
    var inputs = document.getElementsByTagName("input");
    dieta = []
    nombre = value.split("&")[1]
  
    if( document.getElementById(value).checked){
      dieta.push([nombre, "add"])
          
    } else {
      dieta.push([nombre, "remove"])          
    }
    console.log(dieta)

    fetch("/dieta", {
      method: "POST", 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dieta),
    }).then(res => {
      return res.text();
    }).then((html) => {
      document.body.innerHTML = html 
      expander();
    });
    
}
