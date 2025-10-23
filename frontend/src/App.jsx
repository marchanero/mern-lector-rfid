import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [tags, setTags] = useState([])

  useEffect(() => {
    fetchTags()
    const interval = setInterval(fetchTags, 5000) // Actualizar cada 5 segundos
    return () => clearInterval(interval)
  }, [])

  const fetchTags = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/tags')
      setTags(response.data)
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  return (
    <div className="App">
      <h1>Lector RFID</h1>
      <ul>
        {tags.map((tag) => (
          <li key={tag.id}>
            ID: {tag.tagId} - Timestamp: {new Date(tag.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App