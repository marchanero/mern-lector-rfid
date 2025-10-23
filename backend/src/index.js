const express = require('express');
const { SerialPort } = require('serialport');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Puerto serial (ajustar según el puerto del lector RFID conectado al ESP8266)
const port = new SerialPort({
  path: '/dev/tty.usbserial-FTB6SPL3', // Puerto detectado
  baudRate: 115200, // Baud rate típico para ESP8266
});

// Buffer para acumular datos del puerto serial
let serialBuffer = '';

// Leer datos del puerto serial
port.on('data', async (data) => {
  serialBuffer += data.toString();
  let lines = serialBuffer.split('\n');
  serialBuffer = lines.pop(); // Última línea incompleta queda en buffer

  for (let line of lines) {
    line = line.trim();
    if (line) {
      console.log('Línea recibida:', line);
      try {
        const jsonData = JSON.parse(line);
        console.log('JSON parseado:', jsonData);

        // Procesar según el evento
        if (jsonData.event === 'card_detected' && jsonData.uid) {
          const tagId = jsonData.uid;
          console.log('Tag ID detectado:', tagId);

          await prisma.rFIDTag.create({
            data: { tagId },
          });
          console.log('Tag guardado en DB');
        } else if (jsonData.event === 'card_removed') {
          console.log('Tarjeta removida:', jsonData.uid);
        } else {
          console.log('Evento no procesado:', jsonData.event);
        }
      } catch (error) {
        console.error('Error parseando JSON:', error.message);
      }
    }
  }
});

// API para obtener tags
app.get('/api/tags', async (req, res) => {
  const tags = await prisma.rFIDTag.findMany();
  res.json(tags);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});