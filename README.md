# MERN Lector RFID

Aplicación para leer tarjetas RFID vía puerto serial, almacenar en base de datos SQL local con Prisma, y mostrar en interfaz React con Vite.

## Estructura del proyecto

- `backend/`: Servidor Express con Prisma y serialport
- `frontend/`: Cliente React con Vite

## Instalación

```bash
npm install  # Instala dependencias del raíz (concurrently)
npm run install:all  # Instala dependencias de backend y frontend
```

## Ejecución

### Desarrollo (ambos servicios)
```bash
npm run dev
```

Esto lanza backend y frontend concurrentemente.

### Individual
```bash
npm run dev:backend   # Solo backend
npm run dev:frontend  # Solo frontend
```

### Producción
```bash
npm run build  # Construir frontend
npm start      # Ejecutar backend
```

## Uso

Conectar el lector RFID al puerto serial, ejecutar el backend para leer IDs, y el frontend para visualizar.

## Formato de datos JSON

El ESP8266 envía los datos en formato JSON vía puerto serial, cada mensaje en una línea separada por `\n`.

Ejemplos de JSONs esperados:

- Detección de tarjeta: `{"event":"card_detected","uid":"7a3e0f06","type":"MIFARE 1KB","size":4}`
- Remoción de tarjeta: `{"event":"card_removed","uid":"7a3e0f06"}`
- Estado: `{"event":"status","uptime":1093157,"cards_detected":0,"free_heap":51672}`

El código procesa automáticamente los eventos `card_detected` para guardar el `uid` en la base de datos.

### Notas sobre el formato

Asegúrate de que el ESP8266 envíe cada JSON en una línea completa terminada con `\n`.

### Baud Rate

Configurado en 115200, que es el baud rate típico para ESP8266.

### Código de ejemplo para ESP8266

```cpp
#include <SoftwareSerial.h>
#include <ArduinoJson.h> // Instalar librería ArduinoJson

SoftwareSerial rfidSerial(2, 3); // RX, TX para el lector RFID

void setup() {
  Serial.begin(115200);
  rfidSerial.begin(9600);
}

void loop() {
  if (rfidSerial.available()) {
    String tagId = rfidSerial.readStringUntil('\n');
    tagId.trim();

    // Crear JSON
    StaticJsonDocument<200> doc;
    doc["tagId"] = tagId;
    // doc["timestamp"] = "algun timestamp"; // Opcional

    String jsonString;
    serializeJson(doc, jsonString);
    Serial.println(jsonString); // Enviar JSON al PC
  }
}
```
