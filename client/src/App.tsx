import { Toaster } from 'react-hot-toast'
import './styles/global.css'
import AppRoutes from './app/routes/Approutes'
import { AuthProvider } from './shared/services/auth/AuthContext'

function App() {

  return (
    <AuthProvider>
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 5000,
          style: {
            background: "",
            color: "",
          },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
