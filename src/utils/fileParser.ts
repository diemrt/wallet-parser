import * as XLSX from 'xlsx';
import type { Transaction, TransactionSummary } from '../types/transaction';

export const parseExcelFile = async (file: File): Promise<TransactionSummary> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Prendi il primo foglio
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Converti in JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Rimuovi la prima riga (header) se presente
        const dataRows = jsonData.slice(1) as unknown[][];
        
        const transactions: Transaction[] = dataRows
          .filter(row => row.length >= 6) // Assicurati che ci siano abbastanza colonne
          .map(row => ({
            dataContabile: row[0]?.toString() || '',
            dataValuta: row[1]?.toString() || '',
            importo: parseFloat((row[2]?.toString() || '0').replace(',', '.')) || 0,
            divisa: row[3]?.toString() || 'EUR',
            causaleDescrizione: row[4]?.toString() || '',
            canale: row[5]?.toString() || ''
          }))
          .filter(transaction => 
            !!transaction.dataContabile && 
            !isNaN(transaction.importo)
          );

        const summary = calculateSummary(transactions);
        resolve(summary);
        
      } catch (error) {
        reject(new Error('Errore nel parsing del file Excel: ' + error));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Errore nella lettura del file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const parseCSVFile = async (file: File): Promise<TransactionSummary> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        // Rimuovi la prima riga (header) se presente
        const dataLines = lines.slice(1);
        
        const transactions: Transaction[] = dataLines
          .filter(line => line.trim())
          .map(line => {
            // Dividi per pipe (|) o punto e virgola (;) o virgola
            const columns = line.split(/[|;,]/).map(col => col.trim());
            
            if (columns.length >= 6) {
              return {
                dataContabile: columns[0] || '',
                dataValuta: columns[1] || '',
                importo: parseFloat((columns[2]?.replace(',', '.')) || '0') || 0,
                divisa: columns[3] || 'EUR',
                causaleDescrizione: columns[4] || '',
                canale: columns[5] || ''
              };
            }
            return null;
          })
          .filter((transaction): transaction is Transaction => 
            transaction !== null && 
            !!transaction.dataContabile && 
            !isNaN(transaction.importo)
          );

        const summary = calculateSummary(transactions);
        resolve(summary);
        
      } catch (error) {
        reject(new Error('Errore nel parsing del file CSV: ' + error));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Errore nella lettura del file'));
    };
    
    reader.readAsText(file);
  });
};

function calculateSummary(transactions: Transaction[]): TransactionSummary {
  const totalEntrate = transactions
    .filter(t => t.importo > 0)
    .reduce((sum, t) => sum + t.importo, 0);

  const totalUscite = transactions
    .filter(t => t.importo < 0)
    .reduce((sum, t) => sum + t.importo, 0);

  const saldo = totalEntrate + totalUscite;

  // Categorizza le spese
  const categorieSpese: { [key: string]: number } = {};
  
  transactions
    .filter(t => t.importo < 0)
    .forEach(transaction => {
      const categoria = categorizeTransaction(transaction);
      categorieSpese[categoria] = (categorieSpese[categoria] || 0) + transaction.importo;
    });

  return {
    totalEntrate,
    totalUscite,
    saldo,
    categorieSpese,
    transazioni: transactions.sort((a, b) => {
      // Ordina per data decrescente
      const dateA = parseDate(a.dataContabile);
      const dateB = parseDate(b.dataContabile);
      return dateB.getTime() - dateA.getTime();
    })
  };
}

function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

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
