import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button } from '../components/ui';
import { criarUsuario } from '../services/usuarios';
import { useAuthStore } from '../store';
import { cpfValido, formatarCpf, mascararCpf, somenteDigitos } from '../utils/cpf';
import './Auth.css';

const ESTADO_INICIAL = {
  cpf: '',
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
};

const CAMPOS = ['cpf', 'nome', 'email', 'senha', 'confirmarSenha'];

function mensagemErroApi(error) {
  const data = error?.response?.data;
  if (!data) return 'Não foi possível concluir o cadastro. Tente novamente.';
  if (typeof data.mensagem === 'string') return data.mensagem;
  if (typeof data.message === 'string') return data.message;
  return 'Erro ao cadastrar. Verifique os dados informados.';
}

function validarCampo(campo, values) {
  switch (campo) {
    case 'cpf': {
      const cpfDigits = somenteDigitos(values.cpf);
      if (!cpfDigits) return 'CPF é obrigatório';
      if (cpfDigits.length < 11) return 'CPF incompleto';
      if (!cpfValido(cpfDigits)) return 'CPF inválido';
      return null;
    }
    case 'nome': {
      const nome = values.nome.trim();
      if (!nome) return 'Nome completo é obrigatório';
      if (nome.length < 3) return 'Informe seu nome completo';
      return null;
    }
    case 'email': {
      const email = values.email.trim();
      if (!email) return 'E-mail é obrigatório';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'E-mail inválido';
      return null;
    }
    case 'senha': {
      if (!values.senha) return 'Senha é obrigatória';
      if (values.senha.length < 6) return 'Senha deve ter no mínimo 6 caracteres';
      return null;
    }
    case 'confirmarSenha': {
      if (!values.confirmarSenha) return 'Confirme sua senha';
      if (values.confirmarSenha !== values.senha) return 'As senhas não coincidem';
      return null;
    }
    default:
      return null;
  }
}

function validarCampos(values) {
  return CAMPOS.reduce((erros, campo) => {
    const erro = validarCampo(campo, values);
    if (erro) erros[campo] = erro;
    return erros;
  }, {});
}

function camposRelacionados(campo) {
  if (campo === 'senha') return ['senha', 'confirmarSenha'];
  return [campo];
}

export default function Cadastro() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [values, setValues] = useState(ESTADO_INICIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState(null);

  const atualizarErros = (nextValues, campos) => {
    setErrors((prev) => {
      const next = { ...prev };
      campos.forEach((campo) => {
        const erro = validarCampo(campo, nextValues);
        if (erro) next[campo] = erro;
        else delete next[campo];
      });
      return next;
    });
  };

  const exibirErro = (campo) => touched[campo] && errors[campo];

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'cpf' ? formatarCpf(value) : value;
    const nextValues = { ...values, [name]: nextValue };

    setValues(nextValues);
    setTouched((prev) => ({ ...prev, [name]: true }));
    atualizarErros(nextValues, camposRelacionados(name));
    if (errorMsg) setErrorMsg(null);
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const fieldValue = name === 'cpf' ? formatarCpf(value) : value;
    const nextValues = { ...values, [name]: fieldValue };

    setTouched((prev) => ({ ...prev, [name]: true }));
    atualizarErros(nextValues, camposRelacionados(name));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errosValidacao = validarCampos(values);
    setTouched(CAMPOS.reduce((acc, campo) => ({ ...acc, [campo]: true }), {}));

    if (Object.keys(errosValidacao).length > 0) {
      setErrors(errosValidacao);
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMsg(null);
    setErrors({});

    try {
      const resposta = await criarUsuario({
        nome: values.nome.trim(),
        cpf: somenteDigitos(values.cpf),
        email: values.email.trim(),
        senha: values.senha,
      });

      setStatus('success');

      login({
        id: resposta.id,
        usuarioId: resposta.id,
        name: resposta.nome,
        email: resposta.email,
        cpf: resposta.cpfMascarado || mascararCpf(values.cpf),
        role: 'user',
        provider: 'zurbi',
      });

      setTimeout(() => navigate('/registrar'), 1200);
    } catch (error) {
      setStatus('error');
      setErrorMsg(mensagemErroApi(error));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-card--wide">
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
            <span>Cadastro cidadão — identificação com CPF</span>
          </div>

          <div className="auth-body">
            <div className="auth-header">
              <img src="/zUrbi-logo.png" alt="zUrbi" className="auth-logo" />
              <h2>Criar conta no zUrbi</h2>
              <p>
                Informe seus dados para reportar e acompanhar ocorrências urbanas em Porto Seguro.
              </p>
            </div>

            {status === 'success' && (
              <Alert variant="success" className="auth-alert" role="status">
                Cadastro realizado com sucesso! Redirecionando...
              </Alert>
            )}

            {status === 'error' && errorMsg && (
              <Alert variant="error" className="auth-alert" role="alert">
                {errorMsg}
              </Alert>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="cpf">CPF *</label>
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  placeholder="000.000.000-00"
                  value={values.cpf}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!exibirErro('cpf')}
                  aria-describedby={exibirErro('cpf') ? 'cpf-error' : 'cpf-hint'}
                  disabled={status === 'submitting' || status === 'success'}
                />
                {exibirErro('cpf') && (
                  <div id="cpf-error" className="form-error" role="alert">
                    {errors.cpf}
                  </div>
                )}
                {!exibirErro('cpf') && (
                  <div id="cpf-hint" className="form-hint">
                    Mesmo padrão de identificação do gov.br
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="nome">Nome completo *</label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  placeholder="Como consta no documento"
                  value={values.nome}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!exibirErro('nome')}
                  aria-describedby={exibirErro('nome') ? 'nome-error' : undefined}
                  disabled={status === 'submitting' || status === 'success'}
                />
                {exibirErro('nome') && (
                  <div id="nome-error" className="form-error" role="alert">
                    {errors.nome}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">E-mail *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu.email@exemplo.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!exibirErro('email')}
                  aria-describedby={exibirErro('email') ? 'email-error' : undefined}
                  disabled={status === 'submitting' || status === 'success'}
                />
                {exibirErro('email') && (
                  <div id="email-error" className="form-error" role="alert">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="senha">Senha *</label>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  value={values.senha}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!exibirErro('senha')}
                  aria-describedby={exibirErro('senha') ? 'senha-error' : undefined}
                  disabled={status === 'submitting' || status === 'success'}
                />
                {exibirErro('senha') && (
                  <div id="senha-error" className="form-error" role="alert">
                    {errors.senha}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmarSenha">Confirmar senha *</label>
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  value={values.confirmarSenha}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!exibirErro('confirmarSenha')}
                  aria-describedby={exibirErro('confirmarSenha') ? 'confirmarSenha-error' : undefined}
                  disabled={status === 'submitting' || status === 'success'}
                />
                {exibirErro('confirmarSenha') && (
                  <div id="confirmarSenha-error" className="form-error" role="alert">
                    {errors.confirmarSenha}
                  </div>
                )}
              </div>

              <div className="auth-actions">
                <Button
                  type="submit"
                  variant="govbr"
                  disabled={status === 'submitting' || status === 'success'}
                >
                  {status === 'submitting' ? 'Cadastrando...' : 'Cadastrar conta'}
                </Button>
              </div>
            </form>

            <div className="auth-footer">
              <p>Já possui conta?</p>
              <Link to="/login" className="auth-link">
                Entrar com gov.br ou conta existente
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
