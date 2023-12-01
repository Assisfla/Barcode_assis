const https = require("https");

function buscarProducto(barcode, showAlert = false) {
    return new Promise((resolve, reject) => {
      if (barcode.startsWith('http')) {
        if (showAlert) {
          reject(new Error('Por favor, escanea un código de barras en lugar de un código QR.'));
        } else {
          resolve(null);
        }
        return;
      }
  
      const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
      console.log(`Solicitud a la API: ${url}`);
  
      https.get(url, (resp) => {
        let data = '';
  
        resp.on('data', (chunk) => {
          data += chunk;
        });
  
        resp.on('end', () => {
          try {
            const producto = JSON.parse(data);
            if (producto && producto.product && producto.product.product_name) {
              const nombre = obtenerNombreProducto(producto);
              resolve({ ...producto, nombre });
            } else {
              console.log('Nombre del producto no disponible. Producto:', producto);
              resolve({ ...producto, nombre: 'Nombre no disponible' });
            }
          } catch (error) {
            console.error('Error al analizar la respuesta JSON:', error.message);
            reject(new Error(`Error al analizar la respuesta JSON: ${error.message}`));
          }
        });
  
      }).on('error', (err) => {
        reject(new Error('Error en la solicitud: ' + err.message));
      });
    });
  }
  
  function obtenerNombreProducto(producto) {
    if (producto && producto.product && producto.product.product_name) {
      const nombre = producto.product.product_name;
      return nombre;
    } else {
      return 'Nombre no disponible';
    }
  }
  
  function validarFechaCaducidad(fechaCaducidad, mensajeProductoCaducadoMostrado) {
    const fechaActual = new Date();
    const [dia, mes, año] = fechaCaducidad.split('/'); 
    const fechaCaducidadDate = new Date(`${año}-${mes}-${dia}`);
  
    if (fechaCaducidadDate < fechaActual) {
      if (!mensajeProductoCaducadoMostrado) {
        console.log('¡Producto caducado!');
        mensajeProductoCaducadoMostrado = true;
      }
    }
  }
  

module.exports = {
  buscarProducto,
  obtenerNombreProducto,
  validarFechaCaducidad,
};
