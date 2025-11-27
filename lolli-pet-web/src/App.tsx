import { Route, Routes } from 'react-router-dom';

import { Footer } from './components/Footer';
import { Heading } from './components/Heading';
import { Home } from './components/Home';

import CadastrarCliente from './components/pages/CadastrarCliente';
import { GerenciarClientes } from './components/pages/GerenciarClientes';
import { AgendamentoClinico } from './components/pages/AgendamentoClinico';
import { AgendamentoPetshop } from './components/pages/AgendamentoPetshop';
import { Agenda } from './components/pages/Agenda';
import Prontuario from './components/pages/Prontuario';
import { NotFound } from './components/pages/NotFound';

// Páginas de autenticação
import Login from './components/pages/Login';
import Signup from './components/pages/Signup';

// Context de autenticação
import { AuthProvider } from './components/context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

export function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        <Heading />
        <main className="flex-1">
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Rotas Protegidas - Requerem Autenticação */}
            <Route
              path="/cadastrar-cliente"
              element={
                <ProtectedRoute>
                  <CadastrarCliente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gerenciar-clientes"
              element={
                <ProtectedRoute>
                  <GerenciarClientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agendamento-clinico"
              element={
                <ProtectedRoute>
                  <AgendamentoClinico />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agendamento-petshop"
              element={
                <ProtectedRoute>
                  <AgendamentoPetshop />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agenda"
              element={
                <ProtectedRoute>
                  <Agenda />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prontuario"
              element={
                <ProtectedRoute>
                  <Prontuario />
                </ProtectedRoute>
              }
            />

            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
