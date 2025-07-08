import { useState } from 'react';
import FileDropzone from './components/FileDropzone';
import TransactionReport from './components/TransactionReport';
import { parseExcelFile, parseCSVFile } from './utils/fileParser';
import type { TransactionSummary } from './types/transaction';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let parsedSummary: TransactionSummary;
      
      if (file.name.endsWith('.csv')) {
        parsedSummary = await parseCSVFile(file);
      } else {
        parsedSummary = await parseExcelFile(file);
      }
      
      setSummary(parsedSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto durante l\'elaborazione del file');
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSummary(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Wallet Parser
          </h1>
          <p className="text-lg text-gray-600">
            Analizza il tuo estratto conto e ottieni insights sulle tue spese
          </p>
        </div>

        {!summary ? (
          <div className="max-w-2xl mx-auto">
            <FileDropzone onFileUpload={handleFileUpload} isLoading={isLoading} />
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Errore</h3>
                    <p className="mt-2 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Esempio formato file */}
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Formato file richiesto
              </h3>
              <p className="text-blue-700 mb-3">
                Il file deve contenere le seguenti colonne (in quest'ordine):
              </p>
              <div className="bg-white border border-blue-200 rounded p-3 font-mono text-sm">
                <div className="text-gray-600 mb-2">
                  Data Contabile | Data Valuta | Importo | Divisa | Causale/Descrizione | Canale
                </div>
                <div className="text-gray-800">
                  07/07/2025 | 07/07/2025 | -9,5 | EUR | spesa pagobancomat - carta *3579-mcdonald's... | online
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Pulsante per caricare un nuovo file */}
            <div className="mb-6 text-center">
              <button
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Carica nuovo file
              </button>
            </div>

            {/* Report */}
            <TransactionReport summary={summary} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
