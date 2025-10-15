import {
  CreatePersonBody,
  AddPersonResponse,
  GetAllPersonsQuery,
  GetAllPersonsResponse,
  SearchPersonQuery,
  SearchPersonResponse,
  GetPersonResponse,
  UpdatePersonBody,
  UpdatePersonResponse,
  DeletePersonResponse,
} from "../shared_types/person_types";
import { api } from "./api";

export const createPerson = async (data: CreatePersonBody): Promise<AddPersonResponse> => {
  const response = await api.post("/add-person", data);
  return response.data;
};

export const fetchAllPersons = async (params?: Partial<GetAllPersonsQuery>): Promise<GetAllPersonsResponse> => {
  const response = await api.get("/all-person", { params });
  return response.data;
};

export const searchPersons = async (searchParams: Partial<SearchPersonQuery>): Promise<SearchPersonResponse> => {
  const response = await api.get("/search-person", { params: searchParams });
  return response.data;
};

export const fetchPersonById = async (id: string): Promise<GetPersonResponse> => {
  const response = await api.get(`/person/${id}`);
  return response.data;
};

export const updatePerson = async (id: string, data: UpdatePersonBody): Promise<UpdatePersonResponse> => {
  const response = await api.put(`/person/${id}`, data);
  return response.data;
};

export const deletePerson = async (id: string): Promise<DeletePersonResponse> => {
  const response = await api.delete(`/person/${id}`);
  return response.data;
};
