import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const isCompact = new URLSearchParams(window.location.search).has('compact')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App compact={isCompact} />
  </StrictMode>,
)
