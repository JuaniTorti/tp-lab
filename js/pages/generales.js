const tipoEleccion = 2;
const tipoRecuento = 1;

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


async function FuncionFiltrar(){

    var txt_verde = document.getElementById("texto-verde")
    var txt_amarillo = document.getElementById("texto-amarillo")
    var txt_rojo = document.getElementById("texto-rojo")

   
    try{
        if(comboAnio.value != "" && comboCargo.value != "" && comboDistrito.value != "" && comboSeccion.value != ""){
    
            var categoriaId = datosCargos[comboCargo.value - 1]._id
            var distritoId = datosDistritos[comboDistrito.value]._id
            var seccionId = datosDistritos[comboDistrito.value].SeccionesProvinciales[0].Secciones[comboSeccion.value - 1]._id

            console.log(categoriaId)
            console.log(distritoId)
            console.log(seccionId)

            txt_amarillo.style.visibility = "hidden" //se elimina el cartel por si antes se mostro y ahora esta bien la operacion
            txt_rojo.style.visibility = "hidden"

            var promesa = await fetch(`https://resultados.mininterior.gob.ar/api/resultados/getResultados?anioEleccion=${comboAnio.value}&tipoRecuento=${tipoRecuento}&tipoEleccion=${tipoEleccion}&categoriaId=${categoriaId}&distritoId=${distritoId}&seccionProvincialId=null&seccionId=${seccionId}&circuitoId=""&mesaId=""`);
            console.log(promesa);
            if(promesa.status == 200){
                var datos = await promesa.json();
                console.log(datos)
            }
            else{
                txt_rojo.style.visibility = "visible" //muestro cartel rojo
            }
        }
        else{
            txt_amarillo.innerText = "Complete todos los campos solicitados"
            txt_amarillo.style.visibility = "visible" //muestro cartel amarillo
        }
    }
    catch(err){
        console.log(err);
    }
}