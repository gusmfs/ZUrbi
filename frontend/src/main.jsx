import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/accessibility.css'
import App from './App.jsx'
import VLibrasWidget from './components/VLibrasWidget.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VLibrasWidget />
    <App />
  </StrictMode>,
)
