import { Person } from "./db_types";
import { ErrorResponse, PaginatedResponse, SuccessMessageResponse, SuccessResponse } from "./types";

export interface CreatePersonBody {
  name: string;
  phoneNo?: string;
  desc?: string;
}

export interface UpdatePersonBody {
  name?: string;
  phoneNo?: string;
  desc?: string;
}

export interface PersonIdParams {
  id: string;
}

export interface GetAllPersonsQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  order?: string;
  includeSettled?: string;
}

export interface SearchPersonQuery {
  name?: string;
  phoneNo?: string;
  createdAfter?: string;
  createdBefore?: string;
  page?: string;
  limit?: string;
}

export type AddPersonResponse = SuccessResponse<Person> | ErrorResponse;
export type UpdatePersonResponse = SuccessResponse<Person> | ErrorResponse;
export type GetPersonResponse = SuccessResponse<Person> | ErrorResponse;
export type DeletePersonResponse = SuccessMessageResponse | ErrorResponse;
export type GetAllPersonsResponse = PaginatedResponse<Person> | ErrorResponse;
export type SearchPersonResponse = PaginatedResponse<Person> | ErrorResponse;
