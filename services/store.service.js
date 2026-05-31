import { CONFIG } from "../config/storeConfig/config.js";
import { deleteMethod, get, post, put } from "../utils/http.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

export function getProducts() {
  return get(`${CONFIG.BASE_URL}/${CONFIG.PRODUCTS_PATH}`, "GetProducts");
}

export function getProductById(id) {
  return get(
    `${CONFIG.BASE_URL}/${CONFIG.PRODUCTS_PATH}/${randomIntBetween(1, 20)}`,
    "GetProductById",
  );
}

export function addNewProduct(payload) {
  return post(
    `${CONFIG.BASE_URL}/${CONFIG.PRODUCTS_PATH}`,
    payload,
    "AddNewProduct",
  );
}

export function updateProductById(payload) {
  return put(
    `${CONFIG.BASE_URL}/${CONFIG.PRODUCTS_PATH}/${randomIntBetween(1, 20)}`,
    payload,
    "UpdateProductById",
  );
}

export function deleteProductById() {
  return deleteMethod(
    `${CONFIG.BASE_URL}/${CONFIG.PRODUCTS_PATH}/${randomIntBetween(1, 20)}`,
    "DeleteProductById",
  );
}
