import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MapReport from './pages/MapReport';
import Dashboard from './pages/Dashboard';
import AnaliseDesempenho from './pages/AnaliseDesempenho';
import Admin from './pages/Admin';
import Login from './pages/Login';
import './styles/apple.css';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mapa" element={<MapReport />} />
          <Route path="/acompanhar" element={<Dashboard />} />
          <Route path="/analise" element={<AnaliseDesempenho />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h1>Página não encontrada</h1>
            <p>A página que você está procurando não existe.</p>
          </div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
