export interface Transaction {
  dataContabile: string;
  dataValuta: string;
  importo: number;
  divisa: string;
  causaleDescrizione: string;
  canale: string;
}

export interface TransactionSummary {
  totalEntrate: number;
  totalUscite: number;
  saldo: number;
  categorieSpese: { [key: string]: number };
  transazioni: Transaction[];
}

export interface CategoryData {
  nome: string;
  importo: number;
  percentuale: number;
  transazioni: number;
}
