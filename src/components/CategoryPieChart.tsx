import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryPieChartProps {
  data: { nome: string; importo: number }[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF', '#FF6699', '#FFB347', '#B6D7A8', '#FFD700', '#FF6347', '#4682B4', '#6A5ACD', '#20B2AA', '#FF7F50', '#6495ED', '#DC143C', '#2E8B57', '#FF4500', '#8A2BE2', '#00CED1'
];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="importo"
            nameKey="nome"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name }) => name}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
