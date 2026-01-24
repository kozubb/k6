import http from "k6/http";
import { check, sleep, group } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

// Test configuration
export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
    "http_req_duration{name:00_GetCsrfToken}": ["p(95)<200"],
    "http_req_duration{name:01_RegisterAction}": ["p(95)<200"],
    "http_req_duration{name:02_LoginAction}": ["p(95)<500"],
    "http_req_duration{name:03_RatingsAfterLogin}": ["p(95)<200"],
    "http_req_duration{name:04_HomeWithAuth}": ["p(95)<200"],
    "http_req_duration{name:05_GetPizzaSuggestion}": ["p(95)<300"],
    "http_req_duration{name:06_PostRating}": ["p(95)<200"],
  },
};

const BASE_URL = "https://quickpizza.grafana.com";
const username = `testuser_${randomString(8)}`;
const password = `testpassword_${randomString(8)}`;

export default function () {
  let csrfToken;

  // GROUP 01: AUTH
  group("01_Authentication_Flow", function () {
    // Step 00: Fetch CSRF token
    const csrfRes = http.post(
      `${BASE_URL}/api/csrf-token`,
      {},
      { tags: { name: "00_GetCsrfToken" } },
    );

    csrfToken = csrfRes.cookies["csrf_token"]
      ? csrfRes.cookies["csrf_token"][0].value
      : null;

    check(csrfRes, {
      "CSRF token obtained": () => csrfToken !== null,
    });

    if (!csrfToken) {
      console.error("Critical: Could not retrieve CSRF token. Aborting VU.");
      return;
    }

    // Step 01: Register
    const userCredentialPayload = JSON.stringify({
      username: username,
      password: password,
    });

    const registerRes = http.post(
      `${BASE_URL}/api/users`,
      userCredentialPayload,
      {
        headers: { "Content-Type": "application/json" },
        tags: { name: "01_RegisterAction" },
      },
    );

    check(registerRes, {
      "Register status is 201": (r) => r.status === 201,
    });

    // Step 02: Login
    const loginPayload = JSON.stringify({
      username: username,
      password: password,
      csrf: csrfToken,
    });

    const loginRes = http.post(
      `${BASE_URL}/api/users/token/login?set_cookie=true`,
      loginPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Csrf-Token": csrfToken,
        },
        tags: { name: "02_LoginAction" },
      },
    );

    const userToken = loginRes.json().token;

    check(loginRes, {
      "Login status is 200": (r) => r.status === 200,
      "User token received": () => userToken !== undefined,
    });

    // Step 03: Inject session cookie
    const jar = http.cookieJar();
    jar.set(BASE_URL, "qp_user_token", userToken, {
      domain: "quickpizza.grafana.com",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "strict",
    });

    // Step 04: Verify ratings after login
    const ratingsRes = http.get(`${BASE_URL}/api/ratings`, {
      tags: { name: "03_RatingsAfterLogin" },
    });

    check(ratingsRes, {
      "Ratings accessible after login": (r) => r.status === 200,
    });

    sleep(randomIntBetween(1, 2));

    // Step 05: Verify home page with auth
    const homeRes = http.get(BASE_URL, {
      tags: { name: "04_HomeWithAuth" },
    });

    check(homeRes, {
      "Home opened as logged user": (r) => r.status === 200,
    });

    sleep(randomIntBetween(1, 2));
  });

  // GROUP 02: BUSINESS
  group("02_Pizza_Selection_and_Rating", function () {
    // Step 06: Get pizza suggestion
    const pizzaSuggestion = {
      maxCaloriesPerSlice: 1000,
      mustBeVegetarian: false,
      excludedIngredients: [],
      excludedTools: [],
      maxNumberOfToppings: 5,
      minNumberOfToppings: 2,
    };

    const pizzaRes = http.post(
      `${BASE_URL}/api/pizza`,
      JSON.stringify(pizzaSuggestion),
      {
        headers: { "Content-Type": "application/json" },
        tags: { name: "05_GetPizzaSuggestion" },
      },
    );

    const pizzaData = pizzaRes.json();
    const pizzaId = pizzaData.pizza.id;

    check(pizzaRes, {
      "Pizza suggestion status 200": (r) => r.status === 200,
      "Valid pizza ID": () => pizzaId !== undefined,
    });

    sleep(randomIntBetween(1, 2));

    // Step 07: Post rating
    const ratingPayload = JSON.stringify({
      pizza_id: pizzaId,
      stars: 5,
    });

    const ratingRes = http.post(`${BASE_URL}/api/ratings`, ratingPayload, {
      headers: { "Content-Type": "application/json" },
      tags: { name: "06_PostRating" },
    });

    check(ratingRes, {
      "Rating status 201": (r) => r.status === 201,
      "Rating response confirmed": (r) => r.body.includes("id"),
    });
  });

  sleep(randomIntBetween(1, 2));
}
