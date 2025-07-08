import React, { useState, useEffect } from 'react';
import CategoryPieChart from './CategoryPieChart';
import type { Transaction, TransactionSummary, CategoryData } from '../types/transaction';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';

interface TransactionReportProps {
  summary: TransactionSummary;
  budgetMedio: number;
}

const TransactionReport: React.FC<TransactionReportProps> = ({ summary, budgetMedio }) => {
  // Stato per le categorie caricate da JSON
  const [categories, setCategories] = useState<{ label: string; keywords: string[]; budget?: number }[]>([]);
  // Gli state di loading/error non sono usati, quindi li rimuovo

  // Carica le categorie dal file JSON all'avvio
  useEffect(() => {
    fetch('/categories.json')
      .then(res => {
        if (!res.ok) throw new Error('Errore nel caricamento delle categorie');
        return res.json();
      })
      .then(data => {
        setCategories(data.categories || []);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  // Funzione categorizzatrice dinamica
  function categorizeTransactionDynamic(transaction: Transaction): string {
    const description = transaction.causaleDescrizione.toLowerCase();
    for (const cat of categories) {
      if (cat.keywords.some(keyword => description.includes(keyword))) {
        return cat.label;
      }
    }
    return 'Altro';
  }

  // Prepara i dati delle categorie per la visualizzazione
  const categorie: (CategoryData & { budget?: number })[] = Object.entries(summary.categorieSpese)
    .map(([nome, importo]) => {
      const cat = categories.find(c => c.label.toLowerCase() === nome.toLowerCase());
      const budgetPercent = cat?.budget ?? undefined;
      return {
        nome,
        importo: Math.abs(importo),
        percentuale: (Math.abs(importo) / Math.abs(summary.totalUscite)) * 100,
        transazioni: summary.transazioni.filter(t => 
          t.importo < 0 && categorizeTransactionDynamic(t).toLowerCase() === nome.toLowerCase()
        ).length,
        budget: budgetPercent
      };
    })
    .sort((a, b) => b.importo - a.importo);

  // Stati per filtro, tipo transazione e ordinamento
  const [filter, setFilter] = useState('');
  const [transactionType, setTransactionType] = useState<'all' | 'entrate' | 'uscite'>('all');
  const [sortKey, setSortKey] = useState<'data' | 'categoria' | 'importo'>('data');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Stato per la modale di dettaglio transazione
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Funzione di filtro e ordinamento
  const sortedTransactions = [...summary.transazioni]
    .filter(t => {
      // Filtro per tipo di transazione
      if (transactionType === 'entrate' && t.importo < 0) return false;
      if (transactionType === 'uscite' && t.importo >= 0) return false;
      // Filtro per testo
      return (
        t.causaleDescrizione.toLowerCase().includes(filter.toLowerCase()) ||
        categorizeTransactionDynamic(t).toLowerCase().includes(filter.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortKey === 'data') {
        const da = a.dataContabile.split('/').reverse().join('-');
        const db = b.dataContabile.split('/').reverse().join('-');
        return sortDir === 'asc' ? da.localeCompare(db) : db.localeCompare(da);
      }
      if (sortKey === 'categoria') {
        const ca = categorizeTransactionDynamic(a).toLowerCase();
        const cb = categorizeTransactionDynamic(b).toLowerCase();
        return sortDir === 'asc' ? ca.localeCompare(cb) : cb.localeCompare(ca);
      }
      if (sortKey === 'importo') {
        return sortDir === 'asc' ? a.importo - b.importo : b.importo - a.importo;
      }
      return 0;
    });

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

      {/* Categorie di spesa come cards + grafico */}
      {categorie.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cards */}
      {categorie.map((categoria, index) => {
        // Calcolo sforamento budget
        let sforamento = null;
        let maxEuro = 0;
        let sforamentoPercentuale = 0;
        if (categoria.budget && budgetMedio > 0) {
          maxEuro = (categoria.budget / 100) * budgetMedio;
          if (categoria.importo > maxEuro) {
            sforamento = categoria.importo - maxEuro;
            sforamentoPercentuale = (sforamento / budgetMedio) * 100;
          }
        }
        return (
          <div key={index} className="rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 flex flex-col items-center hover:scale-105 transition-transform duration-200">
            <h4 className="font-bold text-lg text-blue-800 capitalize mb-2">{categoria.nome}</h4>
            <p className="text-2xl font-extrabold text-blue-900 mb-1">{formatCurrency(categoria.importo)}</p>
            <p className="text-sm text-blue-700 mb-2">{categoria.transazioni} transazioni</p>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${categoria.percentuale}%` }}></div>
            </div>
            <p className="text-xs text-blue-600">{categoria.percentuale.toFixed(1)}% del totale uscite</p>
            {sforamento !== null && sforamento > 0 && (
                <div
                className={`mt-2 text-xs text-center font-semibold rounded px-2 py-1 border
                  ${sforamentoPercentuale > 10
                  ? 'text-red-700 bg-red-100 border-red-300'
                  : 'text-yellow-700 bg-yellow-100 border-yellow-300'
                  }`}
                >
                  Hai speso <b>{formatCurrency(sforamento)}</b> oltre il budget ({sforamentoPercentuale.toFixed(1)}% oltre il limite)
                </div>
            )}
          </div>
        );
      })}
          {/* Pie Chart */}
          <div className="col-span-1 md:col-span-1 flex items-center justify-center">
            <CategoryPieChart data={categorie} />
          </div>
        </div>
      )}

      {/* Lista transazioni come tabella filtrabile e ordinabile - UI moderna */}
      <div className="max-w-[85rem] px-2 py-8 sm:px-4 lg:px-6 lg:py-10 mx-auto">
        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="p-1.5 min-w-full inline-block align-middle">
              <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Transazioni ({sortedTransactions.length})</h3>
                    <p className="text-sm text-gray-600">Filtra e ordina le tue transazioni facilmente.</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Filtra per descrizione o categoria..."
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 min-w-[220px]"
                      value={filter}
                      onChange={e => setFilter(e.target.value)}
                    />
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                      value={transactionType}
                      onChange={e => setTransactionType(e.target.value as 'all' | 'entrate' | 'uscite')}
                    >
                      <option value="all">Tutte</option>
                      <option value="entrate">Solo Entrate</option>
                      <option value="uscite">Solo Uscite</option>
                    </select>
                  </div>
                </div>
                {/* Table */}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left whitespace-nowrap cursor-pointer select-none text-xs font-semibold uppercase text-gray-800" onClick={() => { setSortKey('data'); setSortDir(sortKey === 'data' && sortDir === 'desc' ? 'asc' : 'desc'); }}>
                        Data {sortKey === 'data' && (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left whitespace-nowrap cursor-pointer select-none text-xs font-semibold uppercase text-gray-800" onClick={() => { setSortKey('categoria'); setSortDir(sortKey === 'categoria' && sortDir === 'desc' ? 'asc' : 'desc'); }}>
                        Categoria {sortKey === 'categoria' && (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left whitespace-nowrap text-xs font-semibold uppercase text-gray-800">
                        Descrizione
                      </th>
                      <th scope="col" className="px-6 py-3 text-left whitespace-nowrap text-xs font-semibold uppercase text-gray-800">
                        Canale
                      </th>
                      <th scope="col" className="px-6 py-3 text-right whitespace-nowrap cursor-pointer select-none text-xs font-semibold uppercase text-gray-800" onClick={() => { setSortKey('importo'); setSortDir(sortKey === 'importo' && sortDir === 'desc' ? 'asc' : 'desc'); }}>
                        Importo {sortKey === 'importo' && (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Riga totale importi */}
                    <tr className="bg-blue-50">
                      <td colSpan={4} className="px-6 py-3 text-right font-bold text-blue-900">Totale importi:</td>
                      <td className="px-6 py-3 text-right font-extrabold text-blue-900">
                        {formatCurrency(sortedTransactions.reduce((acc, t) => acc + t.importo, 0))}
                      </td>
                    </tr>
                    {sortedTransactions.map((transaction, index) => (
                      <tr
                        key={index}
                        className={
                          transaction.importo >= 0
                            ? 'bg-green-50 hover:bg-green-100 border-b border-green-200 cursor-pointer'
                            : 'bg-red-50 hover:bg-red-100 border-b border-red-200 cursor-pointer'
                        }
                        onClick={() => setSelectedTransaction(transaction)}
                        title="Clicca per vedere il dettaglio"
                      >
                        <td className="px-6 py-3 whitespace-nowrap text-sm">{formatDate(transaction.dataContabile)}</td>
                        <td className="px-6 py-3 whitespace-nowrap capitalize text-sm">{categorizeTransactionDynamic(transaction)}</td>
                        <td className="px-6 py-3 text-sm">{transaction.causaleDescrizione.length > 60 ? transaction.causaleDescrizione.substring(0, 60) + '...' : transaction.causaleDescrizione}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm">{transaction.canale}</td>
                        <td className={`px-6 py-3 whitespace-nowrap text-right font-semibold text-sm ${transaction.importo >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(transaction.importo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sortedTransactions.length === 0 && (
                  <div className="text-center text-gray-500 py-8">Nessuna transazione trovata.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modale dettaglio transazione */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setSelectedTransaction(null)}
              aria-label="Chiudi"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-blue-800">Dettaglio Transazione</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">Data:</span> {formatDate(selectedTransaction.dataContabile)}</div>
              <div><span className="font-semibold">Categoria:</span> {categorizeTransactionDynamic(selectedTransaction)}</div>
              <div><span className="font-semibold">Descrizione:</span> {selectedTransaction.causaleDescrizione}</div>
              <div><span className="font-semibold">Canale:</span> {selectedTransaction.canale}</div>
              <div><span className="font-semibold">Importo:</span> {formatCurrency(selectedTransaction.importo)}</div>
              {selectedTransaction.dataValuta && (
                <div><span className="font-semibold">Data valuta:</span> {formatDate(selectedTransaction.dataValuta)}</div>
              )}
              {/* Campi extra non presenti nell'interfaccia Transaction sono omessi */}
              {/* Mostra tutte le altre proprietà se presenti */}
              {Object.entries(selectedTransaction).map(([key, value]) => {
                if ([
                  'dataContabile',
                  'dataValuta',
                  'causaleDescrizione',
                  'canale',
                  'importo',
                  'causale',
                  'categoria',
                  'note'
                ].includes(key)) return null;
                return (
                  <div key={key}><span className="font-semibold">{key}:</span> {String(value)}</div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// La funzione di categorizzazione è ora dinamica e usa le categorie caricate da JSON

export default TransactionReport;
