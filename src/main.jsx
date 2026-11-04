import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../app/page.jsx';
import '../app/globals.css';
import '../app/brand-theme.css';

createRoot(document.getElementById('root')).render(<Home />);
