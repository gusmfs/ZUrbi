import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Button } from '../components/ui';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleGovBrLogin = () => {
    const mockUser = {
      id: 'a1000001-0000-4000-8000-000000000001',
      usuarioId: 'a1000001-0000-4000-8000-000000000001',
      name: 'Maria Silva',
      role: 'user',
      cpf: '***.***.***-35',
      provider: 'gov.br',
    };

    login(mockUser);
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-govbr-bar">
            <img
              src="https://ajuda.gov.br/interface/padrao-govbr/images/govbr-logo-large.png"
              alt=""
              aria-hidden
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span>Acesso gov.br</span>
          </div>

          <div className="auth-body">
            <div className="auth-header">
              <img src="/zUrbi-logo.png" alt="zUrbi Logo" className="auth-logo" />
              <h2>Entrar no zUrbi</h2>
              <p>Acesse o sistema para reportar e acompanhar problemas urbanos</p>
            </div>

            <div className="auth-actions">
              <Button
                type="button"
                variant="govbr"
                onClick={handleGovBrLogin}
                aria-label="Entrar com conta gov.br"
              >
                Entrar com gov.br
              </Button>
            </div>

            <div className="auth-footer">
              <p>Ainda não tem conta?</p>
              <Link to="/cadastro" className="auth-link">
                Cadastrar com CPF
              </Link>
              <p className="form-hint" style={{ marginTop: '1rem' }}>
                O acesso via gov.br é simulado nesta versão de demonstração.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
