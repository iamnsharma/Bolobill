import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { applyShopThemeToDocument, DEFAULT_SHOP_SETTINGS } from './contexts/ShopSettingsContext';
import App from './App';
import './styles/main.scss';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

applyShopThemeToDocument(DEFAULT_SHOP_SETTINGS);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);
