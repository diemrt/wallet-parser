import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryBudgetPieChartProps {
  data: { nome: string; budget: number }[];
}

const COLORS = [
  '#2563eb', // blu moderno
  '#10b981', // verde acqua
  '#f59e42', // arancione moderno
  '#ef4444', // rosso moderno
  '#6366f1', // indaco
  '#f43f5e', // rosa acceso
  '#fbbf24', // giallo moderno
  '#0ea5e9', // azzurro
  '#a21caf', // viola intenso
  '#14b8a6', // teal
  '#eab308', // giallo scuro
  '#3b82f6', // blu chiaro
  '#22d3ee', // ciano
  '#7c3aed', // viola
  '#f87171', // rosso chiaro
  '#4ade80', // verde chiaro
  '#f472b6', // rosa pastello
  '#2dd4bf', // teal chiaro
  '#e11d48', // rosso intenso
  '#64748b'  // grigio moderno
];

const CategoryBudgetPieChart: React.FC<CategoryBudgetPieChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="budget"
            nameKey="nome"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            label={({ name, percent }) => `${name}${typeof percent === 'number' ? ` (${(percent * 100).toFixed(1)}%)` : ''}`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBudgetPieChart;
