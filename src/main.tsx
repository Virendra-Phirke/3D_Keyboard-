import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

let container = document.getElementById('root');
if (container) {
  const newContainer = document.createElement('div');
  newContainer.id = 'root';
  container.replaceWith(newContainer);
  container = newContainer;
} else {
  container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

