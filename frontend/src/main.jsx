import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { UserProvider } from './context/UserContext';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h1 className="text-2xl font-bold text-[#f3ba2f]">Something went wrong</h1>
            <p className="text-gray-400 mt-2">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2 rounded font-semibold bg-[#f3ba2f] text-black hover:bg-[#e0a923] transition-transform transform hover:scale-105"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <UserProvider>
          <App />
        </UserProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);