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
        
        // Prova a rilevare il separatore di colonna dalla prima riga di dati
        let separator = ',';
        if (dataLines.length > 0) {
          if (dataLines[0].includes(';')) separator = ';';
          else if (dataLines[0].includes('|')) separator = '|';
        }

        const transactions: Transaction[] = dataLines
          .filter(line => line.trim())
          .map(line => {
            // Split solo sul separatore rilevato
            const columns = line.split(separator).map(col => col.trim());
            if (columns.length >= 6) {
              // Gestione decimali con virgola
              let importoRaw = columns[2] || '0';
              // Rimuovi eventuali "." come separatore migliaia e sostituisci "," con "." per i decimali
              importoRaw = importoRaw.replace(/\./g, '').replace(',', '.');
              return {
                dataContabile: columns[0] || '',
                dataValuta: columns[1] || '',
                importo: parseFloat(importoRaw) || 0,
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

// Nuova funzione che usa il file categories.json per la categorizzazione
import categoriesData from '../../public/categories.json';

function categorizeTransaction(transaction: Transaction): string {
  const description = transaction.causaleDescrizione.toLowerCase();
  // Scorri tutte le categorie e cerca una corrispondenza LIKE (inclusione) in lowercase
  for (const category of (categoriesData.categories || [])) {
    for (const keyword of category.keywords) {
      if (description.includes(keyword.toLowerCase())) {
        return category.label.toLowerCase();
      }
    }
  }
  return 'altro';
}
