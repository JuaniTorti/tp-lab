const tipoEleccion = 1;
const tipoRecuento = 1;

const provincias = mapitas() // variable que tiene los iconos
let colorPartidos = coloresPartidos()

let datosInforme = ""; //para guardar los datos filtrados y usarlos en agregar informe

//para manejar los carteles
var txt_verde = document.getElementById("texto-verde")
var txt_amarillo = document.getElementById("texto-amarillo")
var txt_rojo = document.getElementById("texto-rojo")

let datosCargos = 0; // datos para la carga de distrito
let datosDistritos = 0; // datos para la carga de secciones 

//Se guardan los elementos select para poder cargarlos
let comboAnio = document.getElementById("select-anio");
let comboCargo = document.getElementById("select-cargo");
let comboDistrito = document.getElementById("select-distrito");
let comboSeccion = document.getElementById("select-seccion")

async function FuncionComboAnio() {
    try {
        var promesa = await fetch("https://resultados.mininterior.gob.ar/api/menu/periodos");
        console.log(promesa);

        if (promesa.status == 200) { //si la promesa se resolvio sin problemas
            var datos = await promesa.json();
            console.log("Años para seleccionar")
            console.log(datos); //se muestran los datos obtenidos

            datos.forEach(anio => { //por cada año en la lista
                var option = document.createElement("option");
                option.innerText = anio;
                option.value = anio;
                comboAnio.appendChild(option);
            });
        }
        else {
            console.log("hubo un error en la API")
        }
    }
    catch (err) {
        console.log(err)
    }

}



FuncionComboAnio() //se invoca la funcion para cargar los años e inciar la seleccion



async function FuncionComboCargo() {
    LimpiarCarga(comboCargo)
    LimpiarCarga(comboDistrito)
    LimpiarCarga(comboSeccion)

    try {
        console.log(comboAnio.value);
        var promesa = await fetch("https://resultados.mininterior.gob.ar/api/menu?año=" + comboAnio.value);
        console.log(promesa);

        if (promesa.status == 200) { //si la promesa se resolvio sin problemas
            var datos = await promesa.json();
            console.log("Cargos de ese año en distintas elecciones")
            console.log(datos); //se muestran los datos obtenidos

            datos.forEach(eleccion => {
                if (eleccion.IdEleccion === tipoEleccion) {
                    datosCargos = eleccion.Cargos; //se guradan datos de cargos de ese año para conocer distritos y secciones de cada uno
                    console.log("Cargos del año seleccionado y en la eleccion situada")
                    console.log(datosCargos)

                    eleccion.Cargos.forEach(cargo => {
                        var option = document.createElement("option");
                        option.innerText = cargo.Cargo; // contiene el nombre del cargo
                        option.value = cargo.IdCargo; // contiene el Id del cargo
                        comboCargo.appendChild(option);
                    });
                }

            });
        }
        else {
            console.log("hubo un error en la API")
        }
    }
    catch (err) {
        console.log(err)
    }
}



function LimpiarCarga(combo) { //funcion para limpiar los combos caundo se cambia una opcion previa
    for (var i = combo.length - 1; i > 0; i--) {
        combo.remove(i);
    }

    // Establece la opción predeterminada como seleccionada
    combo.selectedIndex = 0;

}



function FuncionComboDistrito() {
    LimpiarCarga(comboDistrito)
    LimpiarCarga(comboSeccion)

    for (i = 0; i < datosCargos.length; i++) {
        if (datosCargos[i].IdCargo == comboCargo.value) { // Se recorre la informacion de los cargos hasta encontrar el cargo seleccionado

            datosDistritos = datosCargos[i].Distritos; //guardo los datos de los distritos para la carga de secciones
            console.log("Distritos del cargo seleccionado")
            console.log(datosDistritos)

            datosCargos[i].Distritos.forEach(distrito => { //para cada distrito del cargo seleccionado
                var option = document.createElement("option");
                option.innerText = distrito.Distrito; // contiene el nombre del distrito
                option.value = distrito.IdDistrito; // contiene el Id del distrito
                comboDistrito.appendChild(option);
            })
        }
    }
}


function FuncionComboSeccion() {
    LimpiarCarga(comboSeccion);

    if (comboDistrito.value != 0) {
        for (i = 0; i < datosDistritos.length; i++) {
            if (datosDistritos[i].IdDistrito == comboDistrito.value) { // Se recorre la informacion de los distritos hasta encontrar el distrito seleccionado
                console.log("Secciones del distrito selecionado");
                console.log(datosDistritos[i].SeccionesProvinciales[0].Secciones);

                datosDistritos[i].SeccionesProvinciales[0].Secciones.forEach(seccion => { //para cada cada seccion del distrito seleccionado
                    var option = document.createElement("option");
                    option.innerText = seccion.Seccion; // contiene el nombre de la seccion
                    option.value = seccion.IdSeccion; // contiene el Id de la seccion
                    comboSeccion.appendChild(option);
                })
            }

        }
    }
}


async function FuncionFiltrar() {
    try {
        if (comboAnio.value != "" && comboCargo.value != "" && comboDistrito.value != "" && validarSeccion()) {

            let anioEleccion = comboAnio.value;
            let categoriaId = comboCargo.value;
            let distritoId = comboDistrito.value;
            let seccionProvincialId = comboSeccion.value;
            let seccionId = comboSeccion.value;
            let circuitoId = '';
            let mesaId = '';

            txt_amarillo.style.visibility = "hidden" //se elimina el cartel por si antes se mostro y ahora esta bien la operacion
            txt_rojo.style.visibility = "hidden"
            txt_verde.style.visibility = "hidden"

            var promesa = await fetch(`https://resultados.mininterior.gob.ar/api/resultados/getResultados?anioEleccion=${anioEleccion}&tipoRecuento=${tipoRecuento}&tipoEleccion=${tipoEleccion}&categoriaId=${categoriaId}&distritoId=${distritoId}&seccionId=${seccionId}&circuitoId=${circuitoId}&mesaId=${mesaId}`);
            console.log(promesa);
            if (promesa.status == 200) {
                var datos = await promesa.json();
                console.log(datos)
                datosInforme = datos; //se almacenan los datos filtrados para luego poder usarlos en informes.js
                CambiarTituloSubtitulo(datos)
                cambiarRecuadros(datos)
                cambiarMapa()
                cambiarAgrupacionesPoliticas(datos)
                cambiarBarras(datos)
                document.getElementById("sec-contenido").style.visibility = "visible"
            }
            else {
                CambiarTituloSubtitulo()
                txt_rojo.style.visibility = "visible" //muestro cartel rojo
            }
        }
        else {
            txt_amarillo.innerText = "Complete todos los campos solicitados porfavor"
            txt_amarillo.style.visibility = "visible" //muestro cartel amarillo
        }
    }
    catch (err) {
        console.log(err);
    }
}

//se muestra el cartel indicativo y se esconden graficos y titulos
document.getElementById("texto-amarillo").innerText = 'Debe seleccionar los valores a filtrar y hacer clic en el botón FILTRAR';
document.getElementById("texto-amarillo").style.visibility = "visible";
document.getElementById("texto-amarillo").style.color = "black";
document.getElementById("sec-titulo").style.visibility = "hidden";
document.getElementById("sec-contenido").style.visibility = "hidden"


//para validar si se selecciona argentina
function validarSeccion() {
    if (comboDistrito.value == 0) {//si selecciono argentina devuelve tru para que no me diga que falta completar campos
        return true
    }
    if (comboSeccion.value != "") {
        return true
    } else {
        return false
    }
}


function CambiarTituloSubtitulo(datos = "") {
    let seccion = document.getElementById("sec-titulo");
    let eleccion = 0;

    if (tipoEleccion == 1) {
        eleccion = "Paso"
    }
    else {
        eleccion = "Gerenerales"
    }

    //se modifica titulo y subtitulo con los datos seleccionados
    seccion.style.visibility = "visible";
    seccion.innerHTML = `<section id="sec-titulo">
            <h2>Elecciones ${comboAnio.value} | ${eleccion}</h2>
            <p class="texto-path">${comboAnio.value} > ${eleccion} > ${comboCargo.options[comboCargo.selectedIndex].textContent} > ${comboDistrito.options[comboDistrito.selectedIndex].textContent} > ${comboSeccion.options[comboSeccion.selectedIndex].textContent}</p>
        </section>`

    //mostrar carteles correspondientes
    if (datos != "") { //si se paso algun dato
        if (datos.estadoRecuento.cantidadElectores == 0) { //y ese dato no tenia info
            txt_amarillo.innerText = "No se encontro informacion para la solicitud realizada"
            txt_amarillo.style.visibility = "visible" //muestro cartel amarillo si no hay datos
        }
    }
}


function cambiarMapa() {
    divMapa = document.getElementById("mapa");
    divMapa.innerHTML =
        `
        <div class="title">${comboDistrito.options[comboDistrito.selectedIndex].textContent}</div>
        ${provincias[comboDistrito.value]}
    `
}

function cambiarRecuadros(datos) {
    let mesas = document.getElementById("mesas-escrutadas")
    let electores = document.getElementById("electores")
    let participacion = document.getElementById("part-escrutado")

    mesas.innerHTML = `<img src="img/icons/img1.png" style="width: 70px; margin-right: 10px;"/> <!--Icono urna--> Mesas escrutadas: ${datos.estadoRecuento.mesasTotalizadas}`
    electores.innerHTML = `<img src="img/icons/img3.png" style="width: 70px; margin-right: 10px;"/> <!--Icono personas-->  Electores: ${datos.estadoRecuento.cantidadElectores}`
    participacion.innerHTML = `<img src="img/icons/img4.png" style="width: 70px; margin-right: 10px;"/> <!--Icono manos--> Participación sobre escrutado: ${datos.estadoRecuento.participacionPorcentaje}%`
}



function cambiarAgrupacionesPoliticas(datos) {

    let color = 0
    let colorClaro = 0//para almacenar los colores que pertenecen a cada partido
    
    let divAgrupaciones = document.getElementById("agrup-politicas")
    let htmlAgrupaciones =
        `<div class="title" id="title-agrup-politicas">Agrupaciones Políticas</div>
        <div class="info-agrupaciones">`

    for (var i = 0; i < datos.valoresTotalizadosPositivos.length; i++) {

        for (var x = 0; x < colorPartidos.length; x++){
            if(datos.valoresTotalizadosPositivos[i].nombreAgrupacion == colorPartidos[x].nombre){
                color = colorPartidos[x].color
                colorClaro = colorPartidos[x].colorClaro
                break
            }
            else{
                color = colorPartidos[5].color
                colorClaro = colorPartidos[5].colorClaro
            }
        }

        htmlAgrupaciones +=
            `<div class="nombre-agrupacion">${datos.valoresTotalizadosPositivos[i].nombreAgrupacion}
            <hr>
            </div>`

        if (datos.valoresTotalizadosPositivos[i].listas) { //si hay listas dentro del partido
            for (var j = 0; j < datos.valoresTotalizadosPositivos[i].listas.length; j++) {
                htmlAgrupaciones +=
                    `<div class="div-agrupaciones">
                    <div><b>${datos.valoresTotalizadosPositivos[i].listas[j].nombre}</b></div>
                    <div>${(datos.valoresTotalizadosPositivos[i].listas[j].votos * 100) / datos.estadoRecuento.cantidadVotantes}% <br>${datos.valoresTotalizadosPositivos[i].listas[j].votos} votos</div>
                </div>
                <div class="progress" style="background: ${colorClaro};">
                    <div class="progress-bar" style="width:${datos.valoresTotalizadosPositivos[i].votosPorcentaje}%; background: ${color};">
                        <span class="progress-bar-text">${datos.valoresTotalizadosPositivos[i].votosPorcentaje}%</span>
                    </div>
                </div>`
            }
        }
        else {// si no hay listas se carga la barra directamente con los datos del partido (falta definir los colores)
            htmlAgrupaciones +=
                `<div class="div-agrupaciones">
                    <div><b></b></div>
                    <div>${datos.valoresTotalizadosPositivos[i].votosPorcentaje}% <br>${datos.valoresTotalizadosPositivos[i].votos} votos</div>
                </div><div class="progress" style="background: ${colorClaro};">
                    <div class="progress-bar" style="width:${datos.valoresTotalizadosPositivos[i].votosPorcentaje}%; background: ${color};">
                        <span class="progress-bar-text">${datos.valoresTotalizadosPositivos[i].votosPorcentaje}%</span>
                    </div>
                </div>`
        }
    }

    htmlAgrupaciones += `</div>` //para despues de cargar todo
    divAgrupaciones.innerHTML = htmlAgrupaciones
}



function cambiarBarras(datos) {
    let color = ""
    let divBarras = document.getElementById("barras")
    let htmlBarras = 
    `<div class="title">Resumen de votos</div>
     <div class="grid">`

    for (var i = 0; i < datos.valoresTotalizadosPositivos.length && i < 7; i++){ // menor a 7 para seguir la indicacion de no mas de 7 barras
        
        for (var x = 0; x < colorPartidos.length; x++){
            if(datos.valoresTotalizadosPositivos[i].nombreAgrupacion == colorPartidos[x].nombre){
                color = colorPartidos[x].color
                break
            }
            else{
                color = colorPartidos[5].color
            }
        }

        htmlBarras += 
        `<div class="bar" style="--bar-value:${datos.valoresTotalizadosPositivos[i].votosPorcentaje}%; --bar-color: ${color};"
        data-name="${datos.valoresTotalizadosPositivos[i].nombreAgrupacion}"></div>`
    }

    divBarras.innerHTML = htmlBarras 
}


function agregarInforme() {
    let informe = {
        anio: comboAnio.value,
        tipo: 'Paso', //en paso poner Paso
        recuento: 'Provisorio',
        cargo: comboCargo.options[comboCargo.selectedIndex].textContent,
        distrito: comboDistrito.options[comboDistrito.selectedIndex].textContent,
        svgDistrito: provincias[comboDistrito.value],
        seccion: comboSeccion.options[comboSeccion.selectedIndex].textContent,
        datos: datosInforme
    };


    var informesLocal = localStorage.getItem('informes');
    console.log(informesLocal)
    informesLocal = JSON.parse(informesLocal);//para transformarlo en un array
    var enInformes = false;

    for (var i = 0; i < informesLocal.length; i++) {
        if (JSON.stringify(informesLocal[i]) === JSON.stringify(informe)) {// JSON.sringfy es para convertir el informe en cadena 
            enInformes = true;
            break;
        }
    }

    if (!enInformes) {//si el informe no esta ya agregado
        informesLocal.push(informe);

        // Guarda el arreglo actualizado en el localStorage
        localStorage.setItem('informes', JSON.stringify(informesLocal));
        console.log('informe agregado correctamente');
        txt_verde.innerText = "Informe agregado con exito!!"
        txt_verde.style.visibility = "visible"
    } else {

        txt_amarillo.innerText = "No se puede agregar un informe ya existente"
        txt_amarillo.style.visibility = "visible"
        console.log('El JSON ya existe, no se puede agregar.');
    }
}