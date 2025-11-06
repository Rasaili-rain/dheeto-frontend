import { Dheeto, Item, Transaction } from "./db_types";
import { SuccessResponse, ErrorResponse, SuccessMessageResponse, PaginatedResponse } from "./types";

export interface CreateDheetoBody {
  personId: string;
  desc?: string;
  initialItems?: Omit<Item, "_id" | "createdAt" | "settledAt">[];
  initialTransactions?: Omit<Transaction, "_id" | "createdAt">[];
}

export interface UpdateDheetoBody {
  desc?: string;
  isSettled?: boolean;
}

export interface DheetoIdParams {
  id: string;
}

export interface GetAllDheetosQuery {
  personId?: string;
  isSettled?: "true" | "false" | "all";
  page?: string;
  limit?: string;
  sortBy?: "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}

export interface SearchDheetosQuery {
  personId?: string;
  isSettled?: "true" | "false" | "all";
  createdAfter?: string;
  createdBefore?: string;
  desc?: string;
  page?: string;
  limit?: string;
}

export type AddDheetoResponse = SuccessResponse<Dheeto> | ErrorResponse;
export type UpdateDheetoResponse = SuccessResponse<Dheeto> | ErrorResponse;
export type GetDheetoResponse = SuccessResponse<Dheeto> | ErrorResponse;
export type DeleteDheetoResponse = SuccessMessageResponse | ErrorResponse;
export type GetAllDheetosResponse = PaginatedResponse<Dheeto> | ErrorResponse;
export type SearchDheetosResponse = PaginatedResponse<Dheeto> | ErrorResponse;
export type SettleDheetoResponse = SuccessResponse<Dheeto> | ErrorResponse;
