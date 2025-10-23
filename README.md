# 📡 MERN RFID Reader

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4+-purple.svg)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5+-orange.svg)](https://prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-3+-blue.svg)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Aplicación web completa para leer tarjetas RFID mediante ESP8266, almacenar datos en base de datos local y visualizarlos en tiempo real.

## ✨ Características

- 🔄 **Lectura en tiempo real** de tarjetas RFID vía puerto serial
- 💾 **Almacenamiento local** con SQLite y Prisma ORM
- 🌐 **Interfaz web moderna** construida con React + Vite
- 📊 **Dashboard en tiempo real** con historial de lecturas
- 🔧 **Configuración flexible** para diferentes lectores RFID
- 📱 **Responsive design** para múltiples dispositivos
- 🚀 **Desarrollo simplificado** con scripts concurrentes

## 🛠️ Tecnologías Utilizadas

### Backend

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM para base de datos
- **SQLite** - Base de datos local
- **SerialPort** - Comunicación con puerto serial
- **CORS** - Manejo de cross-origin requests

### Frontend

- **React 18** - Biblioteca UI
- **Vite** - Build tool y dev server
- **Axios** - Cliente HTTP
- **CSS3** - Estilos modernos

### Hardware

- **ESP8266** - Microcontrolador WiFi
- **Lector RFID** - Compatible con MIFARE 1KB
- **Conexión USB** - Comunicación serial

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- npm o yarn
- ESP8266 con firmware compatible
- Lector RFID conectado al ESP8266

### Instalación paso a paso

1. **Clona el repositorio**

   ```bash
   git clone https://github.com/marchanero/mern-lector-rfid.git
   cd mern-lector-rfid
   ```

2. **Instala dependencias**

   ```bash
   npm run install:all
   # o individualmente:
   # npm run install:backend
   # npm run install:frontend
   ```

3. **Configura la base de datos**

   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Configura el puerto serial**
   - Conecta el ESP8266 con el lector RFID
   - Verifica el puerto: `npx serialport-list`
   - Actualiza `backend/src/index.js` con el puerto correcto

## 🚀 Uso

### Desarrollo

```bash
# Ejecuta backend y frontend concurrentemente
npm run dev

# O ejecuta individualmente:
npm run dev:backend   # Backend en http://localhost:3001
npm run dev:frontend  # Frontend en http://localhost:5173
```

### Producción

```bash
# Construir frontend
npm run build

# Ejecutar backend
npm start
```

## 📁 Estructura del Proyecto

```text
mern-lector-rfid/
├── backend/                 # Servidor Express
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema de base de datos
│   │   └── dev.db          # Base de datos SQLite
│   └── src/
│       └── index.js        # Servidor principal
├── frontend/               # Cliente React
│   ├── public/
│   ├── src/
│   │   ├── App.jsx         # Componente principal
│   │   ├── main.jsx        # Punto de entrada
│   │   └── index.css       # Estilos globales
│   └── vite.config.js      # Configuración Vite
├── package.json            # Scripts del proyecto
├── .gitignore             # Archivos ignorados
└── README.md              # Esta documentación
```

## 🎨 Interfaz de Usuario

La aplicación web incluye:

- **Lista de lecturas** con timestamps
- **Actualización automática** cada 5 segundos
- **Diseño responsive** para móvil y desktop
- **Indicadores visuales** para estado de conexión

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

Roberto Sánchez

- GitHub: [@marchanero](https://github.com/marchanero)
- LinkedIn: [Tu LinkedIn]

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!

## 📞 Soporte

Si tienes problemas:

1. Revisa los [Issues](https://github.com/marchanero/mern-lector-rfid/issues) existentes
2. Crea un nuevo issue con detalles del error
3. Incluye logs del backend y configuración del hardware
