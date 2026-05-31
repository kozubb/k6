import { group } from "k6";

import { options } from "./config/storeConfig/options.js";
export { options };

import { CONFIG } from "./config/storeConfig/config.js";

import {
  getProducts,
  getProductById,
  addNewProduct,
  updateProductById,
  deleteProductById,
} from "./services/store.service.js";

import {
  validateProducts,
  validateProductsById,
  validateAddNewProduct,
  validateUpdateProduct,
  validateDeleteProduct,
} from "./utils/checks.js";

import { addProduct } from "./utils/dataFactory.js";
const payload = addProduct();

import { thinkTime } from "./utils/sleep.js";

export default function () {
  let productId;

  group("Product Flow", () => {
    const productsRes = getProducts();

    validateProducts(productsRes);

    thinkTime();

    const productByIdRes = getProductById();

    validateProductsById(productByIdRes);

    thinkTime();

    const productAddRes = addNewProduct(payload);

    validateAddNewProduct(productAddRes, payload);

    thinkTime();

    const updateProductByIdRes = updateProductById(payload);

    validateUpdateProduct(updateProductByIdRes, payload);

    thinkTime();

    const deleteProductByIdRes = deleteProductById();

    validateDeleteProduct(deleteProductByIdRes);

    thinkTime();
  });
}
