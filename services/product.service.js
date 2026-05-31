import { CONFIG } from "../config/productConfig/config.js";
import { get, post } from "../utils/http.js";

export function getCategories() {
  return get(`${CONFIG.BASE_URL}/${CONFIG.CATEGORIES_PATH}`, "GetCategories");
}

export function getProductsByCategory(url) {
  return get(url, "GetProductsByCategory");
}

export function getProductById(productId) {
  return get(
    `${CONFIG.BASE_URL}/${CONFIG.PRODUCTS_PATH}/${productId}`,
    "GetProductById",
  );
}

export function addProduct(payload) {
  return post(
    `${CONFIG.BASE_URL}/${CONFIG.PRODUCTS_PATH}/add`,
    payload,
    "AddProduct",
  );
}
