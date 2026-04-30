import React from 'react';
import './AnaliseDesempenho.css';

export default function AnaliseDesempenho() {
  return (
    <div className="analise-desempenho">
      <div className="container">
        <div className="section-header">
          <h2>O Impacto zUrbi: Da Reação à Ação</h2>
          <p>
            A gestão pública moderna não pode ser refém da sorte. Atualmente, a resolução de problemas urbanos opera de forma reativa, gerando custos imprevisíveis e frustração para o cidadão. O zUrbi introduz um novo paradigma: a gestão proativa, orientada por dados. Veja abaixo o impacto quantitativo que nossa solução traz para a cidade, usando como base a análise de 81 ocorrências reais simuladas.
          </p>
        </div>

        {/* --- COMPARATIVO ANTES E DEPOIS --- */}
        <div className="analise-comparison">
          {/* Cenário SEM zUrbi */}
          <div className="scenario-card before">
            <h3>Sem zUrbi: Incerteza e Ineficiência</h3>
            <div className="graph-placeholder before-bg">
              <span>Gráfico de Dispersão: Pontos espalhados</span>
            </div>
            <div className="kpi-grid">
              <div className="kpi-item">
                <div className="kpi-value before-value">36,7 horas</div>
                <div className="kpi-label">Tempo Médio de Resolução</div>
                <p className="kpi-analysis">
                  "Na média, um cidadão espera mais de um dia e meio. Cada hora de espera é um custo para a cidade e um ponto a menos na confiança."
                </p>
              </div>
              <div className="kpi-item">
                <div className="kpi-value before-value">26,9 horas</div>
                <div className="kpi-label">Imprevisibilidade (Desvio Padrão)</div>
                <p className="kpi-analysis">
                  "Este é o dado mais crítico. O processo é uma 'loteria': um chamado pode levar 6 ou 96 horas, e o gestor não tem controle."
                </p>
              </div>
              <div className="kpi-item">
                <div className="kpi-value before-value">29,6%</div>
                <div className="kpi-label">Taxa de Falha (Estouro de SLA de 48h)</div>
                <p className="kpi-analysis">
                  "Quase 1 em cada 3 chamados representa um risco operacional e de imagem pública para a gestão."
                </p>
              </div>
            </div>
          </div>

          {/* Cenário COM zUrbi */}
          <div className="scenario-card after">
            <h3>Com zUrbi: Previsibilidade e Controle</h3>
            <div className="graph-placeholder after-bg">
              <span>Gráfico de Dispersão: Pontos concentrados</span>
            </div>
            <div className="kpi-grid">
              <div className="kpi-item">
                <div className="kpi-value after-value">20 horas <span className="kpi-reduction">(-45%)</span></div>
                <div className="kpi-label">Tempo Médio de Resolução</div>
                <p className="kpi-analysis">
                  "A Triagem Inteligente por IA elimina o atraso burocrático inicial, levando a ocorrência instantaneamente ao órgão correto."
                </p>
              </div>
              <div className="kpi-item">
                <div className="kpi-value after-value">8 horas <span className="kpi-reduction">(-70%)</span></div>
                <div className="kpi-label">Imprevisibilidade (Desvio Padrão)</div>
                <p className="kpi-analysis">
                  "A priorização e o agrupamento de tarefas padronizam o fluxo. O gestor finalmente ganha controle sobre o processo."
                </p>
              </div>
              <div className="kpi-item">
                <div className="kpi-value after-value">8% <span className="kpi-reduction">(-73%)</span></div>
                <div className="kpi-label">Taxa de Falha (Estouro de SLA de 48h)</div>
                <p className="kpi-analysis">
                  "Ao atacar a 'cauda longa' do atendimento, o zUrbi transforma o cumprimento de prazos de exceção para regra."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- CARDS DE EFEITO ZURBI --- */}
        <div className="effect-section">
          <h3>O Efeito zUrbi: Ganhos Reais</h3>
          <div className="effect-cards-grid">
            <div className="effect-card">
              <div className="effect-icon">⚙️</div>
              <h4>Ganho de Eficiência Operacional</h4>
              <p>Redirecionamos recursos para onde são mais necessários, reduzindo o desperdício de tempo e dinheiro público.</p>
            </div>
            <div className="effect-card">
              <div className="effect-icon">📈</div>
              <h4>Gestão Orientada por Dados</h4>
              <p>O gestor deixa de ser reativo para se tornar um estrategista, antecipando crises com base em evidências claras.</p>
            </div>
            <div className="effect-card">
              <div className="effect-icon">❤️</div>
              <h4>Aumento da Satisfação do Cidadão</h4>
              <p>Um serviço rápido, transparente e previsível reconstrói a confiança da população na gestão pública.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}