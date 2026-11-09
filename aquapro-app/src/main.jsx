import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Global tokens, reset and shared primitives first; page CSS modules load after.
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
