import { check } from "k6";

export function validateCategories(response, categoryName) {
  check(response, {
    "categories status 200": (r) => r.status === 200,

    "categories is array": (r) => Array.isArray(r.json()),

    "category exists": (r) => r.json().some((c) => c.slug === categoryName),
  });
}

export function validateProductsList(response, productName) {
  check(response, {
    "products status 200": (r) => r.status === 200,

    "products exists": (r) => Array.isArray(r.json().products),

    "product exists": (r) =>
      r.json().products.some((p) => p.title === productName),
  });
}

export function validateProductDetails(response, productId) {
  check(response, {
    "product status 200": (r) => r.status === 200,

    "correct product id": (r) => r.json().id === productId,

    "title exists": (r) => !!r.json().title,

    "price exists": (r) => !!r.json().price,
  });
}

export function validateAddedProduct(response, payload) {
  check(response, {
    "product created": (r) => r.status === 201,

    "correct title": (r) => r.json().title === payload.title,

    "correct category": (r) => r.json().category === payload.category,

    "correct price": (r) => r.json().price === payload.price,
  });
}
