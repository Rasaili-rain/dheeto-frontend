// ---- one to one mapping to the schema -----//
export interface Person {
  _id: string;
  name: string;
  phoneNo?: string;
  desc?: string;
  createdAt: Date;
  dheetos: Dheeto[];
  totalBalance: number;
  totalGold: number;
  totalSilver: number;
  unsettledDheetosCount: number;
}

export interface Dheeto {
  _id: string;
  items: Item[];
  transactions: Transaction[];
  isSettled: boolean;
  dheetoBalance: number;
  createdAt: Date;
  updatedAt: Date;
  desc?: string;
}

export interface Item {
  _id: string;
  name: string;
  type: "gold" | "silver";
  purity: number;
  weightInTola: number;
  desc?: string;
  isSettled :boolean;
  settledAt: Date | null;
  createdAt: Date;
}

export interface Transaction {
  _id: string;
  type: "gave" | "received";
  amount: number;
  desc?: string;
  createdAt: Date;
}
