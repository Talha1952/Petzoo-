import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { CartProvider } from './contexts/CartContext'
import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <CartProvider>
            <App />
            <Toaster position="top-right" />
          </CartProvider>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  </HashRouter>,
)
