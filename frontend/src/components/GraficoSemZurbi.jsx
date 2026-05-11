import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const dadosSemZurbi = [
  { metrica: 'Tempo Médio de Resolução', valor: 36.7, label: '36,7 h' },
  { metrica: 'Imprevisibilidade', valor: 26.9, label: '26,9 h' },
  { metrica: 'Falha de SLA (%)', valor: 29.6, label: '29,6 %' },
];

export default function GraficoSemZurbi() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dadosSemZurbi}
        layout="vertical"
        margin={{ top: 20, right: 16, left: 24, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--system-gray-4)" />
        <XAxis type="number" domain={[0, 'dataMax + 10']} tick={{ fill: 'var(--label-secondary)' }} />
        <YAxis type="category" dataKey="metrica" width={180} tick={{ fill: 'var(--label-primary)', fontSize: 14 }} />
        <Tooltip formatter={(value) => `${value}`} />
        <Bar dataKey="valor" fill="#d32f2f" radius={[8, 8, 8, 8]}>
          <LabelList dataKey="label" position="right" style={{ fill: 'var(--label-primary)', fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
