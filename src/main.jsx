import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  console.warn("Missing VITE_GOOGLE_CLIENT_ID environment variable");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId || "missing-client-id"}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
