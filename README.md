
## Description

Este proyecto se centra en el desarrollo de una API para la gestión de módulos de la REST API del proyecto Foo Talent, desarrollado por el equipo de la tarde. La iniciativa busca estructurar y optimizar los servicios necesarios para el manejo eficiente de los diferentes módulos que componen la plataforma, asegurando escalabilidad, mantenibilidad y facilidad de integración con otras partes del sistema.

## Technologies 

- [NestJS](https://nestjs.com/) – Framework para construir aplicaciones Node.js eficientes y escalables.
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) – Administración de servicios de Firebase.
- [Passport](http://www.passportjs.org/) – Middleware de autenticación para Node.js.
- [Swagger](https://swagger.io/) – Documentación interactiva de APIs REST.
- [Jest](https://jestjs.io/) – Framework para pruebas automatizadas.

## Project setup

## Cómo Obtener la Clave de Servicio para Firebase Admin SDK

## 1. Ir a la Consola de Firebase

- Accede a [Firebase Console](https://console.firebase.google.com/).
- Selecciona tu proyecto.

## 2. Acceder a Configuración del Proyecto

- Haz clic en el ícono de **engranaje** (⚙️) en la esquina superior izquierda.
- Selecciona **"Configuración del proyecto"**.

## 3. Generar una Nueva Clave de Servicio

- Dentro de la configuración, ve a la pestaña **"Cuentas de servicio"**.
- Haz clic en el botón **"Generar nueva clave privada"**.
- Se descargará un archivo `.json` automáticamente a tu computadora.

## Colocar el bucket, y el firebase config en las variables de entorno

```bash
FIREBASE_STORAGE_BUCKET=
FIREBASE_CONFIG = 
```

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

