//Barcode reader

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");
const path = require("path");

const options = {
  key: fs.readFileSync(path.resolve(__dirname, "../certs/key.pem")),
  cert: fs.readFileSync(path.resolve(__dirname, "../certs/cert.pem")),
};

const server = https.createServer(options, app);

const port = 3001;

app.use(express.static(path.resolve(__dirname, "./src")));

const jsonParser = bodyParser.json();

app.post("/barcode", jsonParser, function (req, res) {
  console.log("barcode recibido desde el navegador", req.body);

  buscarProducto(req.body.barcode)
    .then(producto => {
      registrarLectura(req.body.barcode, "Éxito", producto.product_name);
      guardarDatosEnArchivo();
      res.send({ ok: true, producto: producto });
    })
    .catch(error => {
      console.error('Error al buscar el producto:', error);
      registrarLectura(req.body.barcode, "Error", '');
      res.status(500).send({ error: 'Error al buscar el producto', mensaje: error.message });
    });
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

server.listen(port, () => {
  console.log(`Servidor https corriendo en https://localhost:${port}`);
});

function buscarProducto(barcode, showAlert = false) {
  return new Promise((resolve, reject) => {
    if (barcode.startsWith('http')) {
      if (showAlert) {
        reject(new Error('Por favor, escanea un código de barras en lugar de un código QR.'));
      } else {
        resolve(null); // No hay información válida para devolver
      }
      return;
    }

    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

    https.get(url, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        try {
          const producto = JSON.parse(data);

          if (producto && producto.product) {
            const nombre = producto.product.product_name;
            console.log('Nombre del producto:', nombre);
            resolve(producto.product);
          } else {
            reject(new Error('No se encontró información válida para el código de barras proporcionado.'));
          }
        } catch (error) {
          console.error('Error al analizar la respuesta JSON:', error);
          reject(new Error('Error al analizar la respuesta JSON.'));
        }
      });
    }).on('error', (err) => {
      console.error('Error en la solicitud:', err.message);
      reject(new Error('Error en la solicitud: ' + err.message));
    });
  });
}

let datosLecturas = {
  lecturas: []
};

function registrarLectura(codigoBarras, resultado, nombre) {
  let lectura = {
    codigoBarras: codigoBarras,
    resultado: resultado,
    nombre: nombre,
    fecha: new Date().toISOString()
  };

  datosLecturas.lecturas.push(lectura);
}

function guardarDatosEnArchivo() {
  const datosJSON = JSON.stringify(datosLecturas, null, 2);
  // Utilizamos writeFile de manera asíncrona para no bloquear el hilo principal
  fs.writeFile(path.resolve(__dirname, 'lecturas.json'), datosJSON, 'utf-8', (err) => {
    if (err) {
      console.error('Error al escribir el archivo:', err);
    } else {
      console.log('Datos guardados en el archivo lecturas.json');
    }
  });
}
