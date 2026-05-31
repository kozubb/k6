export const options = {
  scenarios: {
    smoke: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 1,
    },
  },

  thresholds: {
    http_req_failed: ["rate<0.01"],

    http_req_duration: ["p(95)<500"],

    "http_req_duration{name:GetProducts}": ["p(95)<2500"],

    "http_req_duration{name:AddNewProduct}": ["p(95)<3200"],

    "http_req_duration{name:GetProductById}": ["p(95)<2000"],

    "http_req_duration{name:PutProductById}": ["p(95)<2000"],

    "http_req_duration{name:DeleteProductById}": ["p(95)<3200"],
  },
};
