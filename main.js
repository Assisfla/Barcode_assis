/**Servidor https que abre automaticamente el navegador con la url del servidor */

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

// vamos a usar la carpeta src para guardar el html
app.use(express.static(path.resolve(__dirname, "./src")));

// create application/json parser
const jsonParser = bodyParser.json();

// POST /login gets urlencoded bodies
app.post("/barcode", jsonParser, function (req, res) {
  console.log("barcode recibido desde el navegador", req.body);
  buscarProducto(req.body.barcode);
  res.send({ ok: true });
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

server.listen(port, () => {
  console.log(`Servidor https corriendo en https://localhost:${port}`);
});

function buscarProducto(barcode, showAlert = false) {
  return new Promise((resolve, reject) => {
    // Verificar si el código de barras es una URL
    if (barcode.startsWith('http')) {
      // Mostrar un mensaje (en consola o mediante alert)
      if (showAlert) {
        alert('Por favor, escanea un código de barras en lugar de un código QR.');
      } else {
        console.log('Por favor, escanea un código de barras en lugar de un código QR.');
      }
      return;
    }

    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

    https.get(url, (resp) => {
      let data = '';

      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received.
      resp.on('end', () => {
        try {
          const producto = JSON.parse(data);

          // Verificar si la respuesta contiene información válida
          if (producto && producto.product) {
            // Puedes hacer algo con la información del producto aquí
            const nombre = producto.product.product_name;
            console.log('Nombre del producto:', nombre);

            // Resuelve la promesa con el objeto del producto
            resolve(producto.product);
          } else {
            // Si la respuesta no es válida, mostrar un mensaje (en consola o mediante alert)
            if (showAlert) {
              alert('No se encontró información válida para el código de barras proporcionado.');
            } else {
              console.log('No se encontró información válida para el código de barras proporcionado.');
            }
          }
        } catch (error) {
          // Capturar errores al analizar el JSON
          console.error('Error al analizar la respuesta JSON:', error);

          // Mostrar un mensaje (en consola o mediante alert)
          if (showAlert) {
            alert('Error al analizar la respuesta JSON.');
          } else {
            console.log('Error al analizar la respuesta JSON.');
          }

          reject(new Error('Error al analizar la respuesta JSON.'));
        }
      });
    }).on('error', (err) => {
      // Capturar errores de la solicitud
      console.error('Error en la solicitud:', err.message);

      // Mostrar un mensaje (en consola o mediante alert)
      if (showAlert) {
        alert('Error en la solicitud: ' + err.message);
      } else {
        console.log('Error en la solicitud: ' + err.message);
      }

      reject(new Error('Error en la solicitud: ' + err.message));
    });
  });
}
