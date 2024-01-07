import { Product, User } from "@core/core";

interface ProductToBuy {
  id: number;
  quantity: number;
}

export interface ICreateOrder {
  productsToBuy: ProductToBuy[];
  productsFromDB: Product[];
  userId: number;
}
