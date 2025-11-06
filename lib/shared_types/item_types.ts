import { Dheeto } from "./db_types";
import { SuccessResponse, ErrorResponse, SuccessMessageResponse } from "./types";

export interface AddItemBody {
  name: string;
  type: "gold" | "silver";
  purity: number;
  weightInTola: number;
  desc?: string;
}

export interface UpdateItemBody {
  name?: string;
  type?: "gold" | "silver";
  purity?: number;
  weightInTola?: number;
  desc?: string;
  isSettled?: boolean;
  settledAt?:Date| null;
}

export interface ItemIdParams {
  dheetoId: string;
  itemId: string;
}

export type AddItemResponse = SuccessResponse<Dheeto> | ErrorResponse;
export type UpdateItemResponse = SuccessResponse<Dheeto> | ErrorResponse;
export type DeleteItemResponse = SuccessMessageResponse | ErrorResponse;
