// ---- one to one mapping to the schema -----//
export interface Person {
  _id: string;
  name: string;
  phoneNo?: string;
  desc?: string;
  createdAt: Date;
  dheetos: Dheeto[];
  totalBalance: number;
  unsettledDheetosCount: number;
}

export interface Dheeto {
  _id: string;
  items: Item[];
  transactions: Transaction[];
  isSettled: boolean;
  desc?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  _id: string;
  name: string;
  type: "gold" | "silver";
  purity: number;
  weightInTola: number;
  desc?: string;
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
