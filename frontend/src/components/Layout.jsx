import Header from './Header';
import Footer from './Footer';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <Header />
      <main id="main-content" className="layout-main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
