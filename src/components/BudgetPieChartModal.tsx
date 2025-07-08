import React from 'react';
import CategoryBudgetPieChart from './CategoryBudgetPieChart';

interface BudgetPieChartModalProps {
  open: boolean;
  onClose: () => void;
  categories: { nome: string; budget?: number }[];
}

const BudgetPieChartModal: React.FC<BudgetPieChartModalProps> = ({ open, onClose, categories }) => {
  if (!open) return null;

  // Prepara i dati per il pie chart: solo categorie con budget
  const data = categories
    .filter(cat => typeof cat.budget === 'number' && cat.budget! > 0)
    .map(cat => ({ nome: cat.nome, budget: cat.budget! }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[650px] relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Chiudi"
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4 text-center">Percentuali di budget per categoria</h2>
        <CategoryBudgetPieChart data={data} />
      </div>
    </div>
  );
};

export default BudgetPieChartModal;
