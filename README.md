# Proyecto de Lectura de Códigos de Barras con ZXing y Core Node

## Descripción

Este proyecto en JavaScript utiliza la biblioteca ZXing para la generación y lectura de códigos de barras. La aplicación está construida con Core Node y permite decodificar códigos de barras a partir de una transmisión de cámara en vivo.

## Tabla de Contenidos

- [Instalación](#instalación)
- [Uso](#uso)
- [Características](#características)
- [Contribución](#contribución)
- [Licencia](#licencia)


# Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/Assisfla/Barcode_assis.git
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```
Además, ten en cuenta de que necesitarás tener ahabilitadas las dependencias para la ejecución de los códigos contenidos en este proyecto:
1. body-parser
2. colors
3. express
4. inquirer

## Uso

1. Inicia la aplicación:

   ```bash
   npm run start
   ```
2. Abre tu navegador y visita http://localhost:3001.

3. Haz clic en el botón "Start" para comenzar la transmisión de la cámara y decodificar códigos de barras.

4. Si es necesario, selecciona el dispositivo de video deseado en el menú desplegable.

5. Para detener la decodificación, haz clic en el botón "Reset".


## Características

- Utiliza la biblioteca ZXing para la decodificación de códigos de barras.
- Permite la selección de dispositivos de video.
- Envía la información del código de barras decodificado a un servidor Node.js para su procesamiento.
- Guarda los datos de lectura en un archivo lecturas.json.

## Contribución

¡Las contribuciones son bienvenidas! Si deseas contribuir a este proyecto, sigue los pasos a continuación:

1. Forkea el proyecto.
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`).
3. Realiza cambios y haz commit (`git commit -am 'Añade nueva característica'`).
4. Sube los cambios (`git push origin feature/nueva-caracteristica`).
5. Abre una solicitud de extracción.

## Licencia

Este proyecto está bajo la [Licencia MIT](LICENSE.txt).
