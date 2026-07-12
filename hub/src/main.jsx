import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CLERK_PUBLISHABLE_KEY } from './config.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter basename="/hub">
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
