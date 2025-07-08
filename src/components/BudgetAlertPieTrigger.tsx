import React from 'react';

interface BudgetAlertPieTriggerProps {
  categoria: {
    nome: string;
    importo: number;
    percentuale: number;
    transazioni: number;
    budget?: number;
  };
  sforamento: number;
  sforamentoPercentuale: number;
  onShowPieChart: (categoria: string) => void;
}

const BudgetAlertPieTrigger: React.FC<BudgetAlertPieTriggerProps> = ({ categoria, sforamento, sforamentoPercentuale, onShowPieChart }) => {
  return (
    <div
      className={`mt-2 text-xs text-center font-semibold rounded px-2 py-1 border cursor-pointer
        ${sforamentoPercentuale > 10
          ? 'text-red-700 bg-red-100 border-red-300'
          : 'text-yellow-700 bg-yellow-100 border-yellow-300'
        }`}
      onClick={() => onShowPieChart(categoria.nome)}
      title="Visualizza dettagli budget per categoria"
    >
      Hai speso <b>{sforamento.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</b> oltre il budget ({sforamentoPercentuale.toFixed(1)}% oltre il limite)
    </div>
  );
};

export default BudgetAlertPieTrigger;
