
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Erro crítico: Elemento root não encontrado no DOM.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Remove o loader inicial após a primeira renderização
    const loader = document.getElementById('main-loader');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
      }, 100);
    }
  } catch (error) {
    console.error("Erro durante a inicialização do React:", error);
    // Em caso de erro catastrófico, exibe uma mensagem amigável no lugar da tela branca
    rootElement.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;padding:20px;font-family:sans-serif;">
        <h1 style="color:#ef4444;">Ops! Algo deu errado.</h1>
        <p style="color:#6b7280;">Houve um problema ao carregar o sistema da Dellts Informática. Por favor, tente recarregar a página.</p>
        <button onclick="window.location.reload()" style="margin-top:20px;padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer;">Recarregar</button>
      </div>
    `;
  }
}
