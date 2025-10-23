import { useState, useEffect } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import './App.css'

function App() {
  const [tags, setTags] = useState([])
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Conectar a Socket.IO
    const newSocket = io('http://localhost:3001')
    setSocket(newSocket)

    // Cargar tags iniciales
    fetchTags()

    // Escuchar eventos de nuevas tarjetas
    newSocket.on('connect', () => {
      console.log('Conectado a Socket.IO')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Desconectado de Socket.IO')
      setIsConnected(false)
    })

    newSocket.on('new_tag', (newTag) => {
      console.log('Nueva tarjeta detectada:', newTag)
      setTags(prevTags => [newTag, ...prevTags]) // Agregar al inicio de la lista
    })

    // Escuchar eventos de tarjetas removidas (opcional)
    newSocket.on('tag_removed', (data) => {
      console.log('Tarjeta removida:', data.tagId)
      // Aquí podrías implementar lógica para marcar como removida
    })

    // Cleanup
    return () => {
      newSocket.disconnect()
    }
  }, [])

  const fetchTags = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/tags')
      setTags(response.data)
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const testCardDetection = async () => {
    const testTagId = `test_${Date.now().toString().slice(-6)}`
    try {
      await axios.post('http://localhost:3001/api/test-card', { tagId: testTagId })
    } catch (error) {
      console.error('Error creando tarjeta de prueba:', error)
    }
  }

  return (
    <div className="App">
      <h1>📡 Lector RFID - Tiempo Real</h1>
      <div className="status">
        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </span>
        <span className="tag-count">Total: {tags.length} tarjetas</span>
      </div>

      <div className="test-section">
        <button onClick={testCardDetection} className="test-button">
          🧪 Probar Detección de Tarjeta
        </button>
        <p className="test-info">
          Haz clic para simular la detección de una tarjeta RFID (sin hardware)
        </p>
      </div>

      <div className="tags-container">
        {tags.length === 0 ? (
          <p className="no-tags">Esperando detección de tarjetas RFID...</p>
        ) : (
          <ul className="tags-list">
            {tags.map((tag) => (
              <li key={tag.id} className="tag-item">
                <div className="tag-info">
                  <span className="tag-id">🆔 {tag.tagId}</span>
                  <span className="tag-timestamp">
                    📅 {new Date(tag.timestamp).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App