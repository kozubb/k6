import http from "k6/http";
import { check, sleep, group } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

// Test configuration
export const options = {
  vus: 5,
  iterations: 10,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
    "http_req_duration{name:01_GetAllCategories}": ["p(95)<2500"],
    "http_req_duration{name:02_ProductsFromCategory}": ["p(95)<2000"],
    "http_req_duration{name:03_ProductBasedOnId}": ["p(95)<2000"],
    "http_req_duration{name:04_AddNewProduct}": ["p(95)<3200"],
  },
};

const BASE_URL = "https://dummyjson.com";
const pathAllCategories = "products/categories";
const pathProduct = "products";
const categorySmartphones = "smartphones";
const productName = "iPhone X";
const productPrice = 899.99;
const requestBody = {
  // Data to be sent in the POST request body - add new product
  title: "LEGO City Loader",
  description: "LEGO City Yellow Wheel Loader",
  category: "toys",
  price: 15.99,
  discountPercentage: 12.99,
  rating: 4.92,
  stock: 18,
};

export default function () {
  let productId;
  let urlSmartphones;

  group("01_Product requests GET", function () {
    // Step 01: Get all categories and save specific url
    const categoriesRes = http.get(`${BASE_URL}/${pathAllCategories}`, {
      tags: { name: "01_GetAllCategories" },
    });

    check(categoriesRes, {
      "All categories": (r) => r.status === 200,
      "Category exists in response": (r) =>
        r.body.includes(categorySmartphones),
    });

    const categoriesResBody = categoriesRes.json();
    const category = categoriesResBody.find(
      (c) => c.slug === categorySmartphones,
    );

    urlSmartphones = category.url;

    sleep(randomIntBetween(1, 2));

    // Step 02: Get products from saved category
    const smartphoneCategoryRes = http.get(urlSmartphones, {
      tags: { name: "02_ProductsFromCategory" },
    });

    check(smartphoneCategoryRes, {
      "Products from specific category": (r) => r.status === 200,
      "Category contains product": (r) => r.body.includes(productName),
    });

    const smartphoneCategoryResBody = smartphoneCategoryRes.json();

    const product = smartphoneCategoryResBody.products.find(
      (p) => p.title === productName,
    );

    productId = product.id;

    sleep(randomIntBetween(1, 2));
    // Step 03: Get specific product based on saved id

    const productRes = http.get(`${BASE_URL}/${pathProduct}/${productId}`, {
      tags: { name: "03_ProductBasedOnId" },
    });

    check(productRes, {
      "Product with specific id": (r) => r.status === 200,
      "Product has correct id": (r) => r.json().id === productId,
    });

    sleep(randomIntBetween(1, 2));
  });

  group("02_Product requests POST", function () {
    // Step 04: Add new product

    const addProductRes = http.post(
      `${BASE_URL}/${pathProduct}/add`,
      JSON.stringify(requestBody),
      {
        headers: { "Content-Type": "application/json" },
        tags: { name: "04_AddNewProduct" },
      },
    );

    check(addProductRes, {
      "Add new product": (r) => r.status === 201,
      "Correct product added": (r) => r.body.includes(requestBody.title),
    });

    sleep(randomIntBetween(1, 2));
  });
}
