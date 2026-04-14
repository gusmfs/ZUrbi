import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="header-logo">
              <Link to="/" className="logo-link">
                <img src="/zUrbi-logo.png" alt="zUrbi Logo" className="logo-image" />
              </Link>
            </div>
            <nav className="header-nav">
              <Link to="/mapa" className="nav-link">Mapa de Problemas</Link>
              <Link to="/acompanhar" className="nav-link">Acompanhar</Link>
              {user && user.role === 'admin' && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
            </nav>
            <div className="header-auth">
              {user ? (
                <div className="user-menu">
                  <span className="user-name">{user.name}</span>
                  <button onClick={handleLogout} className="btn btn-outline btn-sm">
                    Sair
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn btn-outline btn-sm">
                    Entrar
                  </Link>
                  <Link to="/registrar" className="btn btn-primary btn-sm">
                    Registrar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
