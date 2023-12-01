const tipoEleccion = 2;
const tipoRecuento = 1;

let datosCargos = 0; // datos para la carga de distrito y secciones

let comboAnio = document.getElementById("select-anio");
let comboCargo = document.getElementById("select-cargo");
let comboDistrito = document.getElementById("select-distrito");
let comboSeccion = document.getElementById("select-seccion")


async function FuncionComboAnio() {
    try {
        var promesa = await fetch("https://resultados.mininterior.gob.ar/api/menu/periodos");
        console.log(promesa);
        if (promesa.status == 200) {
            var datos = await promesa.json();
            console.log(datos);

            datos.forEach(anio => {
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
FuncionComboAnio()

async function FuncionComboCargo() {
    LimpiarCarga(comboCargo)
    try {
        console.log(comboAnio.value);
        var promesa = await fetch("https://resultados.mininterior.gob.ar/api/menu?año=" + comboAnio.value);
        console.log(promesa);
        if (promesa.status == 200) {
            var datos = await promesa.json();
            console.log(datos);
            datos.forEach(eleccion => {
                if (eleccion.IdEleccion === tipoEleccion) {
                    datosCargos = eleccion.Cargos; // datos de distritos y secciones
                    eleccion.Cargos.forEach(cargo => {
                        var option = document.createElement("option");
                        option.innerText = cargo.Cargo;
                        option.value = cargo.IdCargo;
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
function LimpiarCarga(combo) {
    for (var i = combo.length - 1; i > 0; i--) {
        combo.remove(i);
    }
}

function FuncionComboDistrito() {
    LimpiarCarga(comboDistrito);
    for (i = 0; i < datosCargos.length; i++) {
        if (datosCargos[i].IdCargo == comboCargo.value) { // Se recorre la informacion de los cargos hasta encontrar el cargo seleccionado
           
            datosCargos[i].Distritos.forEach(distrito => {
                var option = document.createElement("option");
                option.innerText = distrito.Distrito; // contiene el nombre del distrito
                option.value = distrito.IdDistrito; // contiene el Id del distrito
                comboDistrito.appendChild(option);
            })
        }
    }


}


