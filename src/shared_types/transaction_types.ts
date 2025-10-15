import { Dheeto } from "./db_types";
import { SuccessResponse, ErrorResponse, SuccessMessageResponse } from "./types";

export interface AddTransactionBody {
  type: "gave" | "received";
  amount: number;
  desc?: string;
}

export interface UpdateTransactionBody {
  type?: "gave" | "received";
  amount?: number;
  desc?: string;
}

export interface TransactionIdParams {
  dheetoId: string;
  transactionId: string;
}

export type AddTransactionResponse = SuccessResponse<Dheeto> | ErrorResponse;
export type UpdateTransactionResponse = SuccessResponse<Dheeto> | ErrorResponse;
export type DeleteTransactionResponse = SuccessMessageResponse | ErrorResponse;
