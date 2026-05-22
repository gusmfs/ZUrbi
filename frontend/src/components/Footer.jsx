import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>zUrbi · Porto Seguro</h4>
            <p>
              Canal oficial da Prefeitura Municipal de Porto Seguro para registro e
              acompanhamento de demandas urbanas. Sua participação ajuda a cuidar da cidade.
            </p>
          </div>
          <div className="footer-section">
            <h4>Links rápidos</h4>
            <ul>
              <li><Link to="/">Início</Link></li>
              <li><Link to="/registrar">Abrir chamado</Link></li>
              <li><Link to="/acompanhar">Acompanhar</Link></li>
              <li><Link to="/ia">IA no zUrbi</Link></li>
              <li><Link to="/contato">Contato</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Prefeitura</h4>
            <p>Porto Seguro — Bahia</p>
            <p>Atendimento: ouvidoria@portoseguro.ba.gov.br</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-credit">
            &copy; {new Date().getFullYear()} Prefeitura Municipal de Porto Seguro. Plataforma zUrbi.
          </p>
          <p className="footer-credit-sub">Serviço público digital para o cidadão.</p>
        </div>
      </div>
    </footer>
  );
}
