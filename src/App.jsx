import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AITools from './pages/AITools'
import GitHub from './pages/GitHub'   // ✅ NEW

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/ai-tools' element={<AITools />} />
          <Route path='/github' element={<GitHub />} />   
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App