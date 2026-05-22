import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import './Header.css';

function MenuIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
        <path
          d="M6 6l12 12M18 6L6 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`header${menuOpen ? ' is-menu-open' : ''}`}>
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="header-logo">
              <Link to="/" className="logo-link" onClick={closeMenu}>
                <img src="/zUrbi-logo.png" alt="zUrbi" className="logo-image" />
              </Link>
            </div>

            <button
              type="button"
              className="header-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="header-menu-panel"
              aria-label={menuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="sr-only">{menuOpen ? 'Fechar menu' : 'Abrir menu'}</span>
              <MenuIcon open={menuOpen} />
            </button>

            <div
              id="header-menu-panel"
              className="header-menu-panel"
              hidden={!menuOpen}
            >
              <nav className="header-nav" aria-label="Navegação principal">
                <Link to="/registrar" className="nav-link" onClick={closeMenu}>
                  Abrir chamado
                </Link>
                <Link to="/acompanhar" className="nav-link" onClick={closeMenu}>
                  Acompanhar
                </Link>
                <Link to="/analise" className="nav-link" onClick={closeMenu}>
                  Análise
                </Link>
                <Link to="/ia" className="nav-link" onClick={closeMenu}>
                  IA no zUrbi
                </Link>
                <Link to="/central-ia" className="nav-link nav-link-ops" onClick={closeMenu}>
                  Operações
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link" onClick={closeMenu}>
                    Admin
                  </Link>
                )}
              </nav>

              <div className="header-auth">
                {user ? (
                  <div className="user-menu">
                    <span className="user-name">{user.name}</span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn btn-outline btn-sm"
                      aria-label={`Sair da conta de ${user.name}`}
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <div className="auth-buttons">
                    <Link
                      to="/login"
                      className="btn btn-outline btn-sm"
                      onClick={closeMenu}
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/registrar"
                      className="btn btn-primary btn-sm nav-cta-duplicate"
                      onClick={closeMenu}
                    >
                      Abrir chamado
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {menuOpen && (
        <button
          type="button"
          className="header-backdrop"
          aria-label="Fechar menu"
          onClick={closeMenu}
        />
      )}
    </header>
  );
}
