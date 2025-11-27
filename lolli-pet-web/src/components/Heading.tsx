import Logo from '../assets/Logo.svg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  UserPlus,
  Stethoscope,
  Bath,
  Calendar,
  ClipboardList,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User,
  LogIn,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from './context/useTheme';
import { useAuth } from './context/useAuth';

export function Heading() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme(); // 4. Usa o hook para tema e alternância
  const { user, isAuthenticated, logout } = useAuth(); // Hook de autenticação

  // Define classes base para links, agora incluindo estilos para o tema escuro
  const linkBaseClass =
    'text-gray-700 dark:text-gray-200 hover:text-pink-600 dark:hover:text-pink-400 transition duration-300 text-sm font-semibold uppercase px-3 py-2 rounded-lg flex items-center gap-1';

  // Função para determinar a classe ativa, destacando com cor de fundo no tema claro e escuro
  const getLinkClass = (path: string) =>
    location.pathname === path
      ? // Estado Ativo: Fundo ciano claro/escuro, texto ciano escuro/claro
        `text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900 ${linkBaseClass
          .replace('text-gray-700', '')
          .replace('dark:text-gray-200', '')
          .replace('hover:text-pink-600', '')
          .replace('dark:hover:text-pink-400', '')}`
      : linkBaseClass;

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    // 5. Estilos Dark Mode no Header (fundo, borda e sombra)
    <header className='sticky top-0 w-full z-20 shadow-xl dark:shadow-none border-b border-pink-500/20 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-500'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4'>
        {/* Logo Section */}
        <div className='flex items-center gap-2'>
          <Link to='/'>
            <img src={Logo} alt='Logo Lolli Pet' className='h-10 w-auto' />
          </Link>
          {/* 6. Estilo Dark Mode para o texto da Logo */}
          <span className='text-xl font-extrabold text-cyan-800 dark:text-cyan-400 hidden sm:inline'>
            Lolli Pet
          </span>
        </div>

        {/* Navigation Menu (Desktop) */}
        <nav className='hidden md:flex space-x-3'>
          {/* Os links usam o getLinkClass que já tem o Dark Mode */}
          <Link to='/' className={getLinkClass('/')}>
            <HomeIcon size={16} /> HOME
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to='/cadastrar-cliente'
                className={getLinkClass('/cadastrar-cliente')}
              >
                <UserPlus size={16} /> CADASTRO
              </Link>

              <Link
                to='/gerenciar-clientes'
                className={getLinkClass('/gerenciar-clientes')}
              >
                <Users size={16} className='text-purple-600 dark:text-purple-400' /> GERENCIAR
              </Link>

              <Link
                to='/agendamento-clinico'
                className={getLinkClass('/agendamento-clinico')}
              >
                {/* Ícones específicos precisam de dark:text se suas cores forem fixas */}
                <Stethoscope
                  size={16}
                  className='text-cyan-600 dark:text-cyan-400'
                />{' '}
                CLÍNICO
              </Link>

              <Link
                to='/agendamento-petshop'
                className={getLinkClass('/agendamento-petshop')}
              >
                <Bath size={16} className='text-pink-600 dark:text-pink-400' />{' '}
                PETSHOP
              </Link>

              <Link to='/agenda' className={getLinkClass('/agenda')}>
                <Calendar
                  size={16}
                  className='text-yellow-600 dark:text-yellow-400'
                />{' '}
                AGENDA
              </Link>

              <Link to='/prontuario' className={getLinkClass('/prontuario')}>
                <ClipboardList size={16} className='dark:text-gray-200' />{' '}
                PRONTUÁRIO
              </Link>
            </>
          )}
        </nav>

        {/* Botões de Ação (Alternância de Tema + Auth + Menu Mobile) */}
        <div className='flex items-center gap-3'>
          {/* 7. BOTÃO DE TEMA */}
          <button
            onClick={toggleTheme}
            className='p-2 rounded-full text-pink-600 dark:text-yellow-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition'
            aria-label='Alternar Tema'
          >
            {/* Ícone muda com o estado do tema */}
            {theme === 'light' ? (
              <Moon className='h-6 w-6' />
            ) : (
              <Sun className='h-6 w-6' />
            )}
          </button>

          {/* Botões de Autenticação (Desktop) */}
          <div className='hidden md:flex items-center gap-3'>
            {isAuthenticated ? (
              // Usuário autenticado - mostra nome e botão de logout
              <>
                <div className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-pink-50 dark:from-cyan-900/20 dark:to-pink-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700'>
                  <User size={16} className='text-cyan-600 dark:text-cyan-400' />
                  <span className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
                    {user?.nome}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className='flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200'
                  aria-label='Sair'
                >
                  <LogOut size={16} />
                  <span className='text-sm font-semibold'>SAIR</span>
                </button>
              </>
            ) : (
              // Usuário não autenticado - mostra botões de login e signup
              <>
                <Link
                  to='/login'
                  className='flex items-center gap-2 px-3 py-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors duration-200 border border-cyan-600 dark:border-cyan-400'
                >
                  <LogIn size={16} />
                  <span className='text-sm font-semibold'>ENTRAR</span>
                </Link>
                <Link
                  to='/signup'
                  className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white rounded-lg transition-colors duration-200'
                >
                  <UserPlus size={16} />
                  <span className='text-sm font-semibold'>CADASTRAR</span>
                </Link>
              </>
            )}
          </div>

          {/* Botão do Menu Mobile - Visível apenas em telas pequenas */}
          <div className='md:hidden'>
            <button
              onClick={() => setIsOpen(!isOpen)}
              // 8. Estilos Dark Mode para o botão mobile
              className='p-2 text-pink-600 hover:text-cyan-600 dark:text-pink-400 dark:hover:text-cyan-400 transition border border-pink-500 dark:border-pink-400 rounded'
              aria-label='Toggle Menu'
            >
              {isOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile (Dropdown) */}
      {isOpen && (
        // 9. Estilos Dark Mode para o Menu Mobile
        <nav className='md:hidden px-4 pt-2 pb-4 space-y-2 flex flex-col border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-inner'>
          {/* Os links mobile usam o mesmo getLinkClass e já estão adaptados */}
          <Link to='/' onClick={handleLinkClick} className={getLinkClass('/')}>
            <HomeIcon size={16} /> HOME
          </Link>

          {isAuthenticated ? (
            <>
              {/* Links protegidos - apenas para usuários autenticados */}
              <Link
                to='/cadastrar-cliente'
                onClick={handleLinkClick}
                className={getLinkClass('/cadastrar-cliente')}
              >
                <UserPlus size={16} /> CADASTRO
              </Link>

              <Link
                to='/gerenciar-clientes'
                onClick={handleLinkClick}
                className={getLinkClass('/gerenciar-clientes')}
              >
                <Users size={16} className='text-purple-600 dark:text-purple-400' /> GERENCIAR
              </Link>

              <Link
                to='/agendamento-clinico'
                onClick={handleLinkClick}
                className={getLinkClass('/agendamento-clinico')}
              >
                <Stethoscope
                  size={16}
                  className='text-cyan-600 dark:text-cyan-400'
                />{' '}
                CLÍNICO
              </Link>

              <Link
                to='/agendamento-petshop'
                onClick={handleLinkClick}
                className={getLinkClass('/agendamento-petshop')}
              >
                <Bath size={16} className='text-pink-600 dark:text-pink-400' />{' '}
                PETSHOP
              </Link>

              <Link
                to='/agenda'
                onClick={handleLinkClick}
                className={getLinkClass('/agenda')}
              >
                <Calendar
                  size={16}
                  className='text-yellow-600 dark:text-yellow-400'
                />{' '}
                AGENDA
              </Link>

              <Link
                to='/prontuario'
                onClick={handleLinkClick}
                className={getLinkClass('/prontuario')}
              >
                <ClipboardList size={16} className='dark:text-gray-200' />{' '}
                PRONTUÁRIO
              </Link>

              {/* Divisor */}
              <div className='border-t border-gray-200 dark:border-gray-700 my-2'></div>

              {/* Info do usuário */}
              <div className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-pink-50 dark:from-cyan-900/20 dark:to-pink-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700'>
                <User size={16} className='text-cyan-600 dark:text-cyan-400' />
                <span className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
                  {user?.nome}
                </span>
              </div>

              {/* Botão de Logout */}
              <button
                onClick={handleLogout}
                className='flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 w-full justify-center'
              >
                <LogOut size={16} />
                <span className='text-sm font-semibold'>SAIR</span>
              </button>
            </>
          ) : (
            <>
              {/* Botões de Login e Signup para usuários não autenticados */}
              <Link
                to='/login'
                onClick={handleLinkClick}
                className='flex items-center gap-2 px-3 py-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors duration-200 border border-cyan-600 dark:border-cyan-400 justify-center'
              >
                <LogIn size={16} />
                <span className='text-sm font-semibold'>ENTRAR</span>
              </Link>
              <Link
                to='/signup'
                onClick={handleLinkClick}
                className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white rounded-lg transition-colors duration-200 justify-center'
              >
                <UserPlus size={16} />
                <span className='text-sm font-semibold'>CADASTRAR</span>
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
