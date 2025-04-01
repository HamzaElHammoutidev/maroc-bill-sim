
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'

// Create the root and render the app
createRoot(document.getElementById("root")!).render(<App />);

// Add configuration for Vite server
if (import.meta.env.DEV) {
  window.addEventListener('load', () => {
    console.log('Vite dev server configured to run on port 8080');
  });
}
