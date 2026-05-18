export const options = {
  scenarios: {
    smoke: {
      executor: "shared-iterations",
      vus: 5,
      iterations: 10,
    },
  },

  thresholds: {
    http_req_failed: ["rate<0.01"],

    http_req_duration: ["p(95)<500"],

    "http_req_duration{name:GetAllCategories}": ["p(95)<2500"],

    "http_req_duration{name:GetProductsFromCategory}": ["p(95)<2000"],

    "http_req_duration{name:GetProductById}": ["p(95)<2000"],

    "http_req_duration{name:AddProduct}": ["p(95)<3200"],
  },
};
