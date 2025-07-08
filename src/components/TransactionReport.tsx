import React from 'react';
import type { Transaction, TransactionSummary, CategoryData } from '../types/transaction';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';

interface TransactionReportProps {
  summary: TransactionSummary;
}

const TransactionReport: React.FC<TransactionReportProps> = ({ summary }) => {
  // Prepara i dati delle categorie per la visualizzazione
  const categorie: CategoryData[] = Object.entries(summary.categorieSpese)
    .map(([nome, importo]) => ({
      nome,
      importo: Math.abs(importo),
      percentuale: (Math.abs(importo) / Math.abs(summary.totalUscite)) * 100,
      transazioni: summary.transazioni.filter(t => 
        t.importo < 0 && categorizeTransaction(t).toLowerCase() === nome.toLowerCase()
      ).length
    }))
    .sort((a, b) => b.importo - a.importo);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('it-IT');
  };

  return (
    <div className="space-y-6">
      {/* Riepilogo principale */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <ArrowTrendingUpIcon className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-600">Entrate</p>
              <p className="text-2xl font-bold text-green-800">
                {formatCurrency(summary.totalEntrate)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <ArrowTrendingDownIcon className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-600">Uscite</p>
              <p className="text-2xl font-bold text-red-800">
                {formatCurrency(Math.abs(summary.totalUscite))}
              </p>
            </div>
          </div>
        </div>

        <div className={`border rounded-lg p-6 ${
          summary.saldo >= 0 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-center space-x-3">
            <CurrencyEuroIcon className={`w-8 h-8 ${
              summary.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`} />
            <div>
              <p className={`text-sm font-medium ${
                summary.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                Saldo
              </p>
              <p className={`text-2xl font-bold ${
                summary.saldo >= 0 ? 'text-blue-800' : 'text-orange-800'
              }`}>
                {formatCurrency(summary.saldo)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categorie di spesa */}
      {categorie.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Categorie di Spesa
          </h3>
          <div className="space-y-3">
            {categorie.map((categoria, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800 capitalize">
                      {categoria.nome}
                    </h4>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {formatCurrency(categoria.importo)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {categoria.transazioni} transazioni
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${categoria.percentuale}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {categoria.percentuale.toFixed(1)}% del totale uscite
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista transazioni */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Transazioni ({summary.transazioni.length})
        </h3>
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {summary.transazioni.map((transaction, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  transaction.importo >= 0
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {transaction.causaleDescrizione.length > 60
                      ? transaction.causaleDescrizione.substring(0, 60) + '...'
                      : transaction.causaleDescrizione
                    }
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>{formatDate(transaction.dataContabile)}</span>
                    <span className="capitalize">
                      {categorizeTransaction(transaction)}
                    </span>
                    <span>{transaction.canale}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${
                    transaction.importo >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(transaction.importo)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Funzione per categorizzare le transazioni
function categorizeTransaction(transaction: Transaction): string {
  const description = transaction.causaleDescrizione.toLowerCase();
  
  if (description.includes('mcdonald') || description.includes('ristorante') || description.includes('bar') || description.includes('pizzeria')) {
    return 'ristorazione';
  }
  if (description.includes('supermercato') || description.includes('market') || description.includes('alimentari')) {
    return 'alimentari';
  }
  if (description.includes('benzina') || description.includes('carburante') || description.includes('esso') || description.includes('eni')) {
    return 'carburante';
  }
  if (description.includes('farmacia') || description.includes('medico') || description.includes('ospedale')) {
    return 'salute';
  }
  if (description.includes('abbigliamento') || description.includes('scarpe') || description.includes('moda')) {
    return 'abbigliamento';
  }
  if (description.includes('bolletta') || description.includes('utenze') || description.includes('gas') || description.includes('luce')) {
    return 'utenze';
  }
  if (description.includes('banca') || description.includes('commissioni') || description.includes('canone')) {
    return 'bancarie';
  }
  if (description.includes('stipendio') || description.includes('bonifico in entrata')) {
    return 'stipendio';
  }
  
  return 'altro';
}

export default TransactionReport;
