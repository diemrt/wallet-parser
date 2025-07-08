import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useBudgetAlert } from '../hooks/useBudgetAlert';

const BudgetAlert = () => {
  const [showAlertBox, setShowAlertBox] = useState(true);
  const { showAlert, totalBudget } = useBudgetAlert();


  useEffect(() => {
    if (!showAlertBox) return;
    const timer = setTimeout(() => {
      setShowAlertBox(false);
    }, 4000); // 4 secondi
    return () => clearTimeout(timer);
  }, [showAlertBox]);

  if (!showAlertBox) return null;

  return (
    <div className={`absolute bottom-5 right-5 flex items-start max-w-3xl mx-auto rounded-lg border p-4 mb-4 shadow-sm transition-all duration-200
      ${showAlert ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'bg-green-50 border-green-300 text-green-800'}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {showAlert ? (
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
        ) : (
          <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
        )}
      </div>
      <div className="ml-3 flex-1">
        <p className="font-semibold">
          {showAlert ? 'Attenzione:' : 'Configurazione OK:'}
        </p>
        <p className="text-sm mt-1">
          {showAlert
            ? <>La somma dei budget delle categorie arriva al <b>{totalBudget}%</b>. Verifica la configurazione dei budget nelle categorie.</>
            : <>La configurazione dei budget è corretta.</>
          }
        </p>
      </div>
      <button
        type="button"
        aria-label="Chiudi avviso"
        className="absolute top-2 right-2 rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        onClick={() => setShowAlertBox(false)}
      >
        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
};

export default BudgetAlert;
