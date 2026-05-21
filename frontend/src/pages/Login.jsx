import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleGovBrLogin = () => {
    // Simulating Gov.br OAuth login success
    const mockUser = {
      id: 'a1000001-0000-4000-8000-000000000001',
      usuarioId: 'a1000001-0000-4000-8000-000000000001',
      name: 'Maria Silva',
      role: 'user',
      cpf: '***.***.***-**',
      provider: 'gov.br',
    };
    
    login(mockUser);
    
    // Redirect to home or dashboard after successful authentication
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src="/zUrbi-logo.png" alt="zUrbi Logo" className="login-logo" />
            <h2>Entrar no zUrbi</h2>
            <p>Acesse o sistema para reportar e acompanhar problemas</p>
          </div>
          
          <div className="login-actions">
            <button 
              className="btn btn-govbr" 
              onClick={handleGovBrLogin}
            >
              <img src="https://ajuda.gov.br/interface/padrao-govbr/images/govbr-logo-large.png" alt="Gov.br" className="govbr-icon" onError={(e) => e.target.style.display='none'} />
              Entrar com gov.br
            </button>
          </div>
          
          <div className="login-footer">
            <p className="login-hint">
              O acesso é feito via integração segura com o portal do Governo Federal. Nós não armazenamos as suas senhas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
