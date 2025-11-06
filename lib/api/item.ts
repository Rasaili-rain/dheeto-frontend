import { AddItemBody, AddItemResponse, UpdateItemBody, UpdateItemResponse, DeleteItemResponse } from "../shared_types/item_types";
import { api } from "./api";

export const addItem = async (dheetoId: string, data: AddItemBody): Promise<AddItemResponse> => {
  const response = await api.post(`/dheeto/${dheetoId}/add-item`, data);
  return response.data;
};

export const updateItem = async (dheetoId: string, itemId: string, data: UpdateItemBody): Promise<UpdateItemResponse> => {
  const response = await api.put(`/dheeto/${dheetoId}/item/${itemId}`, data);
  return response.data;
};

export const deleteItem = async (dheetoId: string, itemId: string): Promise<DeleteItemResponse> => {
  const response = await api.delete(`/dheeto/${dheetoId}/item/${itemId}`);
  return response.data;
};
