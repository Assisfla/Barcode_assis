const fs = require("fs");

function cargarDatosDesdeArchivo(filePath) {
  try {
    return require(filePath);
  } catch (error) {
    console.error('Error al cargar datos desde el archivo:', error.message);
    return { lecturas: [] };
  }
}

function guardarDatosEnArchivo(filePath, datos) {
  const datosJSON = JSON.stringify(datos, null, 2);
  fs.writeFile(filePath, datosJSON, 'utf-8', (err) => {
    if (err) {
      console.error('Error al escribir el archivo:', err);
    } else {
      console.log('Datos guardados en el archivo lecturas.json');
    }
  });
}

module.exports = {
  cargarDatosDesdeArchivo,
  guardarDatosEnArchivo,
};

