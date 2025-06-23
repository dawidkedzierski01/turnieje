import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import './styles/index.css'
import './styles/bar.css'
import './styles/button.css'
import './styles/form.css'
import './styles/table.css'
import './styles/message-box.css'
import './styles/home.css'
import './styles/team.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
