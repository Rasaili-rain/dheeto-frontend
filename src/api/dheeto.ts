import {
  CreateDheetoBody,
  AddDheetoResponse,
  GetAllDheetosQuery,
  GetAllDheetosResponse,
  SearchDheetosQuery,
  SearchDheetosResponse,
  GetDheetoResponse,
  UpdateDheetoBody,
  UpdateDheetoResponse,
  DeleteDheetoResponse,
} from "../shared_types/dheeto_types";
import { api } from "./api";

export const createDheeto = async (data: CreateDheetoBody): Promise<AddDheetoResponse> => {
  const res = await api.post("/add-dheeto", data);
  return res.data;
};

export const getDheeto = async (id: string): Promise<GetDheetoResponse> => {
  const res = await api.get(`/dheeto/${id}`);
  return res.data;
};

export const getAllDheetos = async (query?: GetAllDheetosQuery): Promise<GetAllDheetosResponse> => {
  const res = await api.get("/all-dheetos", { params: query });
  return res.data;
};

export const searchDheetos = async (query: SearchDheetosQuery): Promise<SearchDheetosResponse> => {
  const res = await api.get("/search-dheetos", { params: query });
  return res.data;
};

export const updateDheeto = async (id: string, data: UpdateDheetoBody): Promise<UpdateDheetoResponse> => {
  const res = await api.put(`/dheeto/${id}`, data);
  return res.data;
};

export const deleteDheeto = async (id: string): Promise<DeleteDheetoResponse> => {
  const res = await api.delete(`/dheeto/${id}`);
  return res.data;
};
