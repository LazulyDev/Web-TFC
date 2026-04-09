# 🚑 Web-TFC

El proyecto Web-TFC nace con el objetivo de desarrollar un sistema integral de gestión de emergencias, inspirado en el modelo operativo utilizado por el Ayuntamiento de Madrid, que permita coordinar de forma eficiente los distintos servicios municipales implicados en situaciones críticas.

La plataforma está diseñada para centralizar la recepción, gestión y distribución de incidencias en tiempo real, facilitando la comunicación entre los equipos de intervención y mejorando la capacidad de respuesta ante emergencias. A través de una arquitectura moderna y escalable, el sistema busca integrar en un único entorno digital a los principales servicios de emergencias del ámbito municipal, como servicios de emergencias sanitarias(SAMUR-PC), Bomberos y Policía Municipal.

---

## 📌 Descripción

**Web-TFC** es un proyecto en desarrollo cuyo objetivo es construir una solución completa que combine:

- Interfaz web moderna
- Backend estructurado y escalable
- Integración con aplicación móvil Android
- Arquitectura preparada para despliegue real

El proyecto se encuentra actualmente en fase temprana, con una base funcional en crecimiento y planificación de despliegue inicial.

---

## 🧱 Estado del proyecto

🚧 **En desarrollo activo**

- Versión actual: `v0.1`
- Estado: Base inicial implementada
- Primer despliegue previsto: **6 de abril de 2026**

---

## 🛠️ Tecnologías utilizadas

### 🌐 Web
- HTML5
- CSS3
- TypeScript
#### Componentes de la web:
##### Landing Page
Su función en crear una buena primera impresión de este servicio y explicar por encima qué queremos lograr.

<img width="1004" height="584" alt="Imagen Landing Page" src="https://github.com/user-attachments/assets/2fa39fd6-e791-441b-ad42-91b0686038f5" />


##### Log-In
Su función es tener un control de los usuarios que van a usar esta web ya que son los que van a coordinar las emergencias. En caso de que se de de alta un usuario que no sea coordinador el login rechazará el acceso al Panel de Control.

<img width="1004" height="583" alt="image" src="https://github.com/user-attachments/assets/3fd4c592-3459-4d16-9e4c-9480a3985490" />


Como detalle interesante el login busca una imagen de forma aleatoria y la cambia. De esta forma podemos tener un login dinámico y estéticamente más interesante.

`[IMAGEN DEL LOGIN]`

`[IMAGEN DEL LOGIN]`

##### Panel de Control
Sirve para: 
- ⚠️ Visualizar las incidencias activas en la ciudad.
- 🔭 Visualizar las unidades disponibles.
- 🦺 Asignar avisos a las unidades.
- 🗺️ visualizar la geolocalización de las unidades
- 
`[IMAGEN DEL PANEL DE CONTROL]`
  
### ⚙️ Backend
Se ha decidido usar el servicio de servidores en la nube Google Firebase para todo el backend
- 👮‍♂️ **Firebase Authenticator**: Es el encargado de gestionar los usuarios, las contraseñas y permitir o prohibir el acceso al Panel de Control.
- 🔥 **Firebase Realtime Database**: Es donde se almacena la información de las unidades así como su geolocalización en constante cambio.
- 💾 **Firebase Firestore**: Es el lugar donde se almacena la información del aviso así como el lugar del suceso.
- ⚒️ **Firebase Functions**: Es el servicio que va a crear un canal de comunicación entre los coordinadores en el Panel de Control y las unidades de intervención usando para ello su identificador (ejemplo: UPR-8027).
- 💬 **Firebase Messaging**: Será el encargado de mandar un mensaje con el contenido del aviso a las unidades de intervención. Dichas unidades verán el mensaje en una notificación persistente en sus teléfonos móviles de dotación.

<img width="959" height="504" alt="image" src="https://github.com/user-attachments/assets/fdf6c28e-4cce-44dc-aaf7-16ce2542a517" />


### 📦 Control de versiones
- Git
- GitHub

### 📱 Aplicación móvil
- Android

👉 Descarga APK (pendiente de despliegue):  
`[ENLACE DISPONIBLE PRÓXIMAMENTE]`

---

## 🧩 Arquitectura (visión general)

El proyecto sigue una estructura modular  de Angular orientada a escalabilidad:

- Separación entre frontend y backend
- Preparado para integración con cliente móvil
- Diseño enfocado a mantenibilidad y evolución futura

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/LazulyDev/Web-TFC.git

# Acceder al proyecto
cd Web-TFC
```

## 🗂️ Versionado

El proyecto sigue versionado semántico adaptado a fase inicial:

| Versión | Estado        | Descripción                     | Fecha           |
|--------|--------------|--------------------------------|----------------|
| v0.1   | En desarrollo | Base inicial del proyecto      | Marzo 2026     |
| v1.0   | Planificada   | Primer despliegue funcional    | 3 Abril 2026   |

## 📄 Documentación Asociada al TFG
Puede leer la memoria de este Trabajo de Fin de Grado en el siguiente enlace:

`[ENLACE DE DESCARGA (MEMORIA NO TERMINADA)]`
