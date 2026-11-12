import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/variables.css';
import './styles/desktop.css';
import './styles/modules.css';
import App from './App.jsx';

const rootElement = document.getElementById('root');
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

