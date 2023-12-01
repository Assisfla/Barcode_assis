const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");
const path = require("path");
const inquirer = require('inquirer');
require('colors');

const barcodeService = require('./barcodeService');
const fileService = require('./fileService');

const options = {
  key: fs.readFileSync(path.resolve(__dirname, "../certs/key.pem")),
  cert: fs.readFileSync(path.resolve(__dirname, "../certs/cert.pem")),
};

const server = https.createServer(options, app);

const port = 3001;

app.use(express.static(path.resolve(__dirname, "./src")));

const jsonParser = bodyParser.json();

let mensajeProductoCaducadoMostrado = false;
let mensajeDatosGuardadosMostrado = false;

const lecturasFilePath = path.resolve(__dirname, 'lecturas.json');

let datosLecturas = fileService.cargarDatosDesdeArchivo(lecturasFilePath);

app.post("/barcode", jsonParser, async function (req, res) {
  mensajeDatosGuardadosMostrado = false;
  mensajeProductoCaducadoMostrado = false;
  
  const producto = await barcodeService.buscarProducto(req.body.barcode);
  const fechaCaducidad = req.body.userInput.fechaCaducidad;
  const numeroArticulos = req.body.userInput.numeroArticulos || 1;

  if (fechaCaducidad) {
    barcodeService.validarFechaCaducidad(fechaCaducidad);
  }

  const userInput = {
    numeroArticulos: numeroArticulos,
    fechaCaducidad: fechaCaducidad,
  };

  await registrarLectura(req.body.barcode, "Éxito", producto, userInput);
  console.log('Nombre del producto después de registrarLectura:', producto.nombre);
  guardarDatosEnArchivo();
  res.send({ ok: true, producto: producto });
});

async function registrarLectura(codigoBarras, resultado, producto, userInput = {}) {
  let nombreProducto = producto.nombre;

  let lectura = {
    codigoBarras: codigoBarras,
    resultado: resultado,
    nombre: nombreProducto,
    fecha: new Date().toISOString(),
    userInput: {
      fechaCaducidad: userInput.fechaCaducidad,
      numeroArticulos: userInput.numeroArticulos,
    },
  };

  datosLecturas.lecturas.push(lectura);
}

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

server.listen(port, async () => {
  const preguntas = [
    {
      type: "list",
      name: "opcion",
      propiedad: "otra",
      message: "¿Qué deseas hacer?",
      choices: [
        {
          value: 1,
          name: `${"1.".green} Listar productos`,
        },
        {
          value: 0,
          name: `${"0.".green} Salir`,
        },
      ],
    },
  ];

  const inquirerMenu = async () => {
    console.log("==========================".green);
    console.log("  Selecciona una opción".white);
    console.log("==========================\n".green);

    const { opcion } = await inquirer.prompt(preguntas);

    return opcion;
  };

  const opciónEscogida = await inquirerMenu();

  if (opciónEscogida === 0) {
    process.exit();
  } else {
    console.log('Para leer los códigos de barras abra tu navegador de preferencia, en https://localhost:3001.');
  }
});

function guardarDatosEnArchivo() {
  if (!mensajeDatosGuardadosMostrado) {
    fileService.guardarDatosEnArchivo(lecturasFilePath, datosLecturas);
    mensajeDatosGuardadosMostrado = true;
  }
}
