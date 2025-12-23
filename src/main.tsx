import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'


// Ensure modal-root exists before rendering the app
const ensureModalRoot = () => {
  if (!document.getElementById('modal-root')) {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'modal-root';
    document.body.appendChild(modalDiv);
  }
}

ensureModalRoot();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
