import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Sobre zUrbi</h4>
            <p>
              zUrbi é uma plataforma colaborativa onde cidadãos reportam problemas urbanos. Juntos, melhoramos nossas cidades.
            </p>
          </div>
          <div className="footer-section">
            <h4>Links Rápidos</h4>
            <ul>
              <li><Link to="/">Início</Link></li>
              <li><Link to="/mapa">Mapa</Link></li>
              <li><Link to="/analise">Análise</Link></li>
              <li><Link to="/contato">Contato</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contato</h4>
            <p>Email: contato@zurbi.gov.br</p>
            <p>Tel: (11) 3000-0000</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 zUrbi. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
