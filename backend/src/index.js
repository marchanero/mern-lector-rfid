const express = require('express');
const { SerialPort } = require('serialport');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const prisma = new PrismaClient();

// Crear servidor HTTP y Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // URL del frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Verificar puertos seriales disponibles al iniciar
async function checkSerialPorts() {
  try {
    const ports = await SerialPort.list();
    console.log('🔍 Puertos seriales disponibles:');
    ports.forEach((port, index) => {
      console.log(`  ${index + 1}. ${port.path} - ${port.manufacturer || 'Sin fabricante'} (${port.serialNumber || 'Sin serial'})`);
    });

    const targetPort = ports.find(p => p.path === TARGET_PORT);
    if (!targetPort) {
      console.log('⚠️  El puerto /dev/tty.usbserial-FTB6SPL3 no está disponible');
      console.log('💡 Conecta tu ESP8266 o verifica el puerto correcto');
    } else {
      console.log('✅ Puerto objetivo encontrado:', targetPort.path);
    }
  } catch (error) {
    console.error('❌ Error listando puertos seriales:', error.message);
  }
}

// Inicializar puerto serial y configurar event listeners
async function setupSerialPort() {
  port = await initializeSerialPort();

  if (port) {
    // Buffer para acumular datos del puerto serial
    let serialBuffer = '';

    // Función para extraer objetos JSON completos del buffer
    function extractCompleteJSONs(buffer) {
      const jsons = [];
      let startIndex = 0;
      let braceCount = 0;
      let inString = false;
      let escapeNext = false;

      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          continue;
        }

        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === '{') {
            if (braceCount === 0) {
              startIndex = i;
            }
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              // Encontramos un objeto JSON completo
              const jsonStr = buffer.substring(startIndex, i + 1);
              jsons.push(jsonStr);
              startIndex = i + 1;
            }
          }
        }
      }

      // Retornar los JSONs encontrados y el buffer restante
      const remainingBuffer = buffer.substring(startIndex);
      return { jsons, remainingBuffer };
    }

    // Leer datos del puerto serial
    port.on('data', async (data) => {
      serialBuffer += data.toString();

      // Extraer JSONs completos del buffer
      const { jsons, remainingBuffer } = extractCompleteJSONs(serialBuffer);
      serialBuffer = remainingBuffer;

      for (let jsonStr of jsons) {
        console.log('📡 JSON completo recibido:', jsonStr);
        try {
          const jsonData = JSON.parse(jsonStr);
          console.log('🔍 JSON parseado:', jsonData);

          // Procesar según el evento
          if (jsonData.event === 'card_detected' && jsonData.uid) {
            const tagId = jsonData.uid;
            console.log('🎯 Tag ID detectado:', tagId);

            try {
              const newTag = await prisma.rFIDTag.create({
                data: { tagId },
              });
              console.log('💾 Tag guardado en DB:', newTag);

              // Emitir evento a todos los clientes conectados
              io.emit('new_tag', newTag);
              console.log('📤 Evento new_tag emitido:', newTag);
            } catch (error) {
              console.error('❌ Error guardando tag:', error);
            }
          } else if (jsonData.event === 'card_removed') {
            console.log('👋 Tarjeta removida:', jsonData.uid);
            // Opcional: emitir evento de remoción
            io.emit('tag_removed', { tagId: jsonData.uid });
          } else {
            console.log('ℹ️  Evento no procesado:', jsonData.event);
          }
        } catch (error) {
          console.error('❌ Error parseando JSON:', error.message, 'JSON:', jsonStr);
        }
      }
    });
  }
}

app.use(cors());
app.use(express.json());

// Puerto serial (ajustar según el puerto del lector RFID conectado al ESP8266)
let port;
const TARGET_PORT = '/dev/tty.usbserial-FTB6SPL3';

// Verificar puertos seriales disponibles al iniciar
async function checkSerialPorts() {
  try {
    const ports = await SerialPort.list();
    console.log('🔍 Puertos seriales disponibles:');
    ports.forEach((port, index) => {
      console.log(`  ${index + 1}. ${port.path} - ${port.manufacturer || 'Sin fabricante'} (${port.serialNumber || 'Sin serial'})`);
    });

    const targetPort = ports.find(p => p.path === TARGET_PORT);
    if (!targetPort) {
      console.log('⚠️  El puerto /dev/tty.usbserial-FTB6SPL3 no está disponible');
      console.log('💡 Conecta tu ESP8266 o verifica el puerto correcto');
    } else {
      console.log('✅ Puerto objetivo encontrado:', targetPort.path);
    }
  } catch (error) {
    console.error('❌ Error listando puertos seriales:', error.message);
  }
}

// Función para inicializar puerto serial
async function initializeSerialPort() {
  try {
    const ports = await SerialPort.list();
    const targetPortInfo = ports.find(p => p.path === TARGET_PORT);

    if (!targetPortInfo) {
      console.log(`⚠️  Puerto ${TARGET_PORT} no encontrado. El servidor funcionará sin puerto serial.`);
      console.log('💡 Conecta tu ESP8266 y reinicia el servidor para habilitar la lectura RFID.');
      return null;
    }

    port = new SerialPort({
      path: TARGET_PORT,
      baudRate: 115200,
    });

    console.log('✅ Puerto serial abierto correctamente');

    // Manejar eventos del puerto serial
    port.on('open', () => {
      console.log('🔌 Puerto serial conectado y listo para recibir datos RFID');
    });

    port.on('error', (err) => {
      console.error('❌ Error en puerto serial:', err.message);
    });

    port.on('close', () => {
      console.log('🔌 Puerto serial cerrado');
    });

    return port;
  } catch (error) {
    console.error('❌ Error al inicializar puerto serial:', error.message);
    console.log('💡 El servidor continuará funcionando sin puerto serial');
    return null;
  }
}

// Inicializar puerto serial y configurar event listeners
async function setupSerialPort() {
  port = await initializeSerialPort();

  if (port) {
    // Buffer para acumular datos del puerto serial
    let serialBuffer = '';

    // Función para extraer objetos JSON completos del buffer
    function extractCompleteJSONs(buffer) {
      const jsons = [];
      let startIndex = 0;
      let braceCount = 0;
      let inString = false;
      let escapeNext = false;

      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          continue;
        }

        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === '{') {
            if (braceCount === 0) {
              startIndex = i;
            }
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              // Encontramos un objeto JSON completo
              const jsonStr = buffer.substring(startIndex, i + 1);
              jsons.push(jsonStr);
              startIndex = i + 1;
            }
          }
        }
      }

      // Retornar los JSONs encontrados y el buffer restante
      const remainingBuffer = buffer.substring(startIndex);
      return { jsons, remainingBuffer };
    }

    // Leer datos del puerto serial
    port.on('data', async (data) => {
      serialBuffer += data.toString();

      // Extraer JSONs completos del buffer
      const { jsons, remainingBuffer } = extractCompleteJSONs(serialBuffer);
      serialBuffer = remainingBuffer;

      for (let jsonStr of jsons) {
        console.log('📡 JSON completo recibido:', jsonStr);
        try {
          const jsonData = JSON.parse(jsonStr);
          console.log('🔍 JSON parseado:', jsonData);

          // Procesar según el evento
          if (jsonData.event === 'card_detected' && jsonData.uid) {
            const tagId = jsonData.uid;
            console.log('🎯 Tag ID detectado:', tagId);

            try {
              const newTag = await prisma.rFIDTag.create({
                data: { tagId },
              });
              console.log('💾 Tag guardado en DB:', newTag);

              // Emitir evento a todos los clientes conectados
              io.emit('new_tag', newTag);
              console.log('📤 Evento new_tag emitido:', newTag);
            } catch (error) {
              console.error('❌ Error guardando tag:', error);
            }
          } else if (jsonData.event === 'card_removed') {
            console.log('👋 Tarjeta removida:', jsonData.uid);
            // Opcional: emitir evento de remoción
            io.emit('tag_removed', { tagId: jsonData.uid });
          } else {
            console.log('ℹ️  Evento no procesado:', jsonData.event);
          }
        } catch (error) {
          console.error('❌ Error parseando JSON:', error.message, 'JSON:', jsonStr);
        }
      }
    });
  }
}

// Buffer para acumular datos del puerto serial
let serialBuffer = '';

// Función para extraer objetos JSON completos del buffer
function extractCompleteJSONs(buffer) {
  const jsons = [];
  let startIndex = 0;
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < buffer.length; i++) {
    const char = buffer[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        if (braceCount === 0) {
          startIndex = i;
        }
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          // Encontramos un objeto JSON completo
          const jsonStr = buffer.substring(startIndex, i + 1);
          jsons.push(jsonStr);
          startIndex = i + 1;
        }
      }
    }
  }

  // Retornar los JSONs encontrados y el buffer restante
  const remainingBuffer = buffer.substring(startIndex);
  return { jsons, remainingBuffer };
}

// API para obtener tags
app.get('/api/tags', async (req, res) => {
  const tags = await prisma.rFIDTag.findMany({
    orderBy: { timestamp: 'desc' }
  });
  res.json(tags);
});

// Endpoint de prueba para simular detección de tarjeta (solo para desarrollo)
app.post('/api/test-card', async (req, res) => {
  const { tagId } = req.body;

  if (!tagId) {
    return res.status(400).json({ error: 'tagId es requerido' });
  }

  try {
    const newTag = await prisma.rFIDTag.create({
      data: { tagId },
    });

    // Emitir evento a todos los clientes conectados
    io.emit('new_tag', newTag);
    console.log('Tarjeta de prueba creada:', newTag);

    res.json({ success: true, tag: newTag });
  } catch (error) {
    console.error('Error creando tag de prueba:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Socket.IO listo para conexiones en tiempo real`);

  // Verificar puertos disponibles
  await checkSerialPorts();

  // Inicializar puerto serial
  await setupSerialPort();
});