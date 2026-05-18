import { group } from "k6";

import { options } from "./config/options.js";
export { options };

import { CONFIG } from "./config/config.js";

import {
  getCategories,
  getProductsByCategory,
  getProductById,
  addProduct,
} from "./services/product.service.js";

import {
  validateCategories,
  validateProductsList,
  validateProductDetails,
  validateAddedProduct,
} from "./utils/checks.js";

import { createProduct } from "./utils/dataFactory.js";

import { thinkTime } from "./utils/sleep.js";

export default function () {
  let productId;
  let categoryUrl;

  group("GET Product Flow", () => {
    const categoriesRes = getCategories();

    validateCategories(categoriesRes, CONFIG.SMARTPHONE_CATEGORY);

    const category = categoriesRes
      .json()
      .find((c) => c.slug === CONFIG.SMARTPHONE_CATEGORY);

    categoryUrl = category.url;

    thinkTime();

    const productsRes = getProductsByCategory(categoryUrl);

    validateProductsList(productsRes, CONFIG.PRODUCT_NAME);

    const product = productsRes
      .json()
      .products.find((p) => p.title === CONFIG.PRODUCT_NAME);

    productId = product.id;

    thinkTime();

    const productRes = getProductById(productId);

    validateProductDetails(productRes, productId);

    thinkTime();
  });

  group("POST Product Flow", () => {
    const payload = createProduct();

    const addProductRes = addProduct(payload);

    validateAddedProduct(addProductRes, payload);

    thinkTime();
  });
}
