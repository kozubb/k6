import {
  randomIntBetween,
  randomString,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

export function createProduct() {
  return {
    title: `LEGO-${randomString(6)}`,

    description: `Description-${randomString(10)}`,

    category: "toys",

    price: randomIntBetween(10, 100),

    discountPercentage: randomIntBetween(5, 20),

    rating: 4.5,

    stock: randomIntBetween(1, 50),
  };
}
