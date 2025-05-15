# API Foo Talent

## Descripción
Este proyecto se centra en el desarrollo de una API para la gestión de módulos de la REST API del proyecto Foo Talent, desarrollado por el equipo de la tarde. La iniciativa busca estructurar y optimizar los servicios necesarios para el manejo eficiente de los diferentes módulos que componen la plataforma, asegurando escalabilidad, mantenibilidad y facilidad de integración con otras partes del sistema.

## Estructura del Proyecto

```
.
├── src
│   ├── applications         # Módulo de aplicaciones
│   │   ├── dto              # Objetos de transferencia de datos para aplicaciones
│   │   └── enums            # Enumeraciones para el módulo de aplicaciones
│   ├── auth                 # Módulo de autenticación
│   │   ├── decorators       # Decoradores personalizados para autenticación
│   │   ├── dto              # Objetos de transferencia de datos para autenticación
│   │   ├── guards           # Guards de protección de rutas
│   │   └── services         # Servicios de autenticación
│   ├── firebase             # Configuración e integración con Firebase
│   ├── notifications        # Módulo de notificaciones
│   │   ├── dto              # Objetos de transferencia de datos para notificaciones
│   │   └── templates        # Plantillas para emails y notificaciones
│   ├── recruitments         # Módulo de reclutamiento
│   │   └── dto              # Objetos de transferencia de datos para reclutamiento
│   ├── tokens               # Módulo de gestión de tokens
│   │   └── dto              # Objetos de transferencia de datos para tokens
│   ├── users                # Módulo de usuarios
│   │   └── dto              # Objetos de transferencia de datos para usuarios
│   └── vacancies            # Módulo de vacantes
│       └── dto              # Objetos de transferencia de datos para vacantes
├── test                     # Pruebas automatizadas
└── uploads                  # Directorio para archivos subidos por los usuarios
```

## Technologies
- [NestJS](https://nestjs.com/) – Framework para construir aplicaciones Node.js eficientes y escalables.
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) – Administración de servicios de Firebase.
- [Passport](http://www.passportjs.org/) – Middleware de autenticación para Node.js.
- [Swagger](https://swagger.io/) – Documentación interactiva de APIs REST.
- [Jest](https://jestjs.io/) – Framework para pruebas automatizadas.
- [Gmail API](https://developers.google.com/gmail/api) – Servicio para envío de correos electrónicos.
- [Pinecone](https://www.pinecone.io/) – Base de datos vectorial para búsquedas similares.
- [Azure OpenAI](https://azure.microsoft.com/services/cognitive-services/openai-service/) – Servicios de IA y embeddings.
- [Azure Redis Cache](https://azure.microsoft.com/services/cache/) – Almacenamiento en caché de alta disponibilidad.

## Project setup

### 1. Cómo Obtener la Clave de Servicio para Firebase Admin SDK

#### 1.1. Ir a la Consola de Firebase
- Accede a [Firebase Console](https://console.firebase.google.com/).
- Selecciona tu proyecto.

#### 1.2. Acceder a Configuración del Proyecto
- Haz clic en el ícono de **engranaje** (⚙️) en la esquina superior izquierda.
- Selecciona **"Configuración del proyecto"**.

#### 1.3. Generar una Nueva Clave de Servicio
- Dentro de la configuración, ve a la pestaña **"Cuentas de servicio"**.
- Haz clic en el botón **"Generar nueva clave privada"**.
- Se descargará un archivo `.json` automáticamente a tu computadora.

### 2. Configuración de Correo Electrónico (Gmail)

#### 2.1. Generar Contraseña de Aplicación en Gmail
- Accede a [Gestión de tu Cuenta de Google](https://myaccount.google.com/).
- Ve a **"Seguridad"** y asegúrate de tener habilitada la verificación en dos pasos.
- Ve a **"Contraseñas de aplicaciones"** (dentro de la sección "Cómo iniciar sesión en Google").
- Selecciona **"Otra"** como tipo de aplicación, asígnale un nombre (ej. "Foo Talent API") y haz clic en **"Generar"**.
- Copia la contraseña generada para usarla en las variables de entorno.

### 3. Configuración de Pinecone

#### 3.1. Obtener API Key de Pinecone
- Regístrate o inicia sesión en [Pinecone Console](https://app.pinecone.io/).
- En la sección **"API Keys"**, crea una nueva API Key o usa una existente.
- Copia la API Key para usarla en las variables de entorno.

#### 3.2. Crear o Seleccionar un Índice
- En la consola de Pinecone, ve a la sección **"Indexes"**.
- Crea un nuevo índice o selecciona uno existente.
- Copia el nombre del índice para usarlo en las variables de entorno.

### 4. Configuración de Azure OpenAI

#### 4.1. Crear un Recurso de Azure OpenAI
- Accede al [Portal de Azure](https://portal.azure.com/).
- Busca "Azure OpenAI" y crea un nuevo recurso.
- Una vez creado, ve a **"Llaves y punto de conexión"** en el menú lateral.
- Copia el nombre del recurso, la clave y la región para usarlos en las variables de entorno.

#### 4.2. Configurar un Modelo de Embeddings
- Dentro del recurso de Azure OpenAI, ve a **"Modelos"**.
- Despliega un modelo de embeddings (como "text-embedding-ada-002").
- Copia el nombre de despliegue para usarlo en las variables de entorno.

### 5. Configuración de Azure Redis Cache

#### 5.1. Crear un Recurso de Azure Cache for Redis
- Accede al [Portal de Azure](https://portal.azure.com/).
- Busca "Azure Cache for Redis" y crea un nuevo recurso.
- Una vez creado, ve a **"Llaves de acceso"** en el menú lateral.
- Copia el nombre del host, el puerto y la clave primaria para usarlos en las variables de entorno.

### 6. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# Firebase Configuration
FIREBASE_STORAGE_BUCKET=
FIREBASE_CONFIG=

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_SERVICE=gmail

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=your-pinecone-index-name

# Azure OpenAI Configuration
AZURE_OPENAI_API_INSTANCE_NAME=your-azure-openai-resource-name
AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=your-embeddings-deployment-name
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_API_VERSION=2023-05-15

# Azure Redis Cache Configuration
REDIS_HOST=your-redis-instance.redis.cache.windows.net
REDIS_PORT=6380
REDIS_PASSWORD=your-redis-primary-key
```

### 7. Instalación de Dependencias

```bash
$ npm install
```

### 8. Compilación y Ejecución del Proyecto

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### 9. Ejecución de Pruebas

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```