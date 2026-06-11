import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MapReport from './pages/MapReport';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AnaliseDesempenho from './pages/AnaliseDesempenho';
import CentralIA from './pages/CentralIA';
import ApresentacaoIA from './pages/ApresentacaoIA';
import Login from './pages/Login';
import ListaOcorrencias from './components/ListaOcorrencias';
import FormOcorrencia from './components/FormOcorrencia';
import './styles/apple.css';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mapa" element={<MapReport />} />
          <Route path="/registrar" element={<MapReport />} />
          <Route path="/abrir-chamado" element={<MapReport />} />
          <Route path="/acompanhar" element={<Dashboard />} />
          <Route path="/ocorrencias" element={<ListaOcorrencias />} />
          <Route path="/nova-ocorrencia" element={<FormOcorrencia />} />
          <Route path="/analise" element={<AnaliseDesempenho />} />
          <Route path="/central-ia" element={<CentralIA />} />
          <Route path="/ia" element={<ApresentacaoIA />} />
          <Route path="/inteligencia-artificial" element={<ApresentacaoIA />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '60px 20px' }} role="alert">
              <h1>Página não encontrada</h1>
              <p>A página que você está procurando não existe.</p>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;