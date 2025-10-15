import { AddTransactionBody, AddTransactionResponse, UpdateTransactionBody, UpdateTransactionResponse, DeleteTransactionResponse } from "../shared_types/transaction_types";
import { api } from "./api";

export const addTransaction = async (dheetoId: string, data: AddTransactionBody): Promise<AddTransactionResponse> => {
  const response = await api.post(`/dheeto/${dheetoId}/add-transaction`, data);
  return response.data;
};

export const updateTransaction = async (dheetoId: string, transactionId: string, data: UpdateTransactionBody): Promise<UpdateTransactionResponse> => {
  const response = await api.put(`/dheeto/${dheetoId}/transaction/${transactionId}`, data);
  return response.data;
};

export const deleteTransaction = async (dheetoId: string, transactionId: string): Promise<DeleteTransactionResponse> => {
  const response = await api.delete(`/dheeto/${dheetoId}/transaction/${transactionId}`);
  return response.data;
};
