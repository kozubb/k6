import http from "k6/http";
import { check, sleep, group } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

// Test configuration

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
    'http_req_duration{ name: "01_LoginAction" }': ["p(95)<500"],
    'http_req_duration{ name: "02_RatingsPageRedirectAfterLogin" }': [
      "p(95)<200",
    ],
    'http_req_duration{ name: "03_HomeWithAuth" }': ["p(95)<200"],
    'http_req_duration{ name: "04_GetPizzaSuggestion" }': ["p(95)<300"],
    'http_req_duration{ name: "05_PostRating" }': ["p(95)<200"],
  },
};

const BASE_URL = "https://quickpizza.grafana.com";

export default function () {
  let csrfToken;

  // GROUP 1: AUTHENTICATION FLOW
  group("01_Authentication_Flow", function () {
    // Step 1: Fetch CSRF token via POST request
    const csrfRes = http.post(`${BASE_URL}/api/csrf-token`, {});

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

    // Step 2: Login process
    const loginPayload = JSON.stringify({
      username: "default",
      password: "12345678",
      csrf: csrfToken,
    });

    const loginParams = {
      headers: {
        "Content-Type": "application/json",
        "X-Csrf-Token": csrfToken,
      },
      tags: { name: "01_LoginAction" },
    };

    const loginRes = http.post(
      `${BASE_URL}/api/users/token/login?set_cookie=true`,
      loginPayload,
      loginParams,
    );

    // Capture the session token from JSON response
    const userToken = loginRes.json().token;

    check(loginRes, {
      "Login status is 200": (r) => r.status === 200,
      "User token received": () => userToken !== undefined,
    });

    // Step 3: Inject the user token into the Cookie Jar for stateful requests
    const jar = http.cookieJar();
    jar.set(BASE_URL, "qp_user_token", userToken, {
      domain: "quickpizza.grafana.com",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "strict",
    });

    console.log(
      `[AUTH] Injected session cookie: qp_user_token=${userToken.substring(
        0,
        10,
      )}...`,
    );

    // Step 4: Verify returned endpoint and response after login
    const ratingsRes = http.get(`${BASE_URL}/api/ratings`, {
      tags: { name: "02_RatingsPageRedirectAfterLogin" },
    });

    check(ratingsRes, {
      "Redirect to ratings page after login has status 200": (r) =>
        r.status === 200,
    });

    sleep(randomIntBetween(1, 2));

    // Step 5: Verify session by hitting the homepage
    const homeRes = http.get(BASE_URL, {
      tags: { name: "03_HomeWithAuth" },
    });

    check(homeRes, {
      "Home opened as a logged in user - status 200": (r) => r.status === 200,
    });

    sleep(randomIntBetween(1, 2));
  });

  // GROUP 2: BUSINESS LOGIC (PIZZA & RATING)
  group("02_Pizza_Selection_and_Rating", function () {
    // Step 6: Get a pizza suggestion
    const pizzaSuggestion = {
      maxCaloriesPerSlice: 1000,
      mustBeVegetarian: false,
      excludedIngredients: [],
      excludedTools: [],
      maxNumberOfToppings: 5,
      minNumberOfToppings: 2,
    };

    const pizzaParams = {
      headers: { "Content-Type": "application/json" },
      tags: { name: "04_GetPizzaSuggestion" },
    };

    const pizzaRes = http.post(
      `${BASE_URL}/api/pizza`,
      JSON.stringify(pizzaSuggestion),
      pizzaParams,
    );

    const pizzaData = pizzaRes.json();
    const pizzaId = pizzaData.pizza.id;

    check(pizzaRes, {
      "Pizza suggestion status 200": (r) => r.status === 200,
      "Valid pizza ID received": () => pizzaId !== undefined,
    });

    console.log(`[PIZZA] Suggested: ${pizzaData.pizza.name} (ID: ${pizzaId})`);

    sleep(randomIntBetween(1, 2));

    // Step 7: Post a rating for the suggested pizza
    const ratingPayload = JSON.stringify({
      pizza_id: pizzaId,
      stars: 5,
    });

    const ratingParams = {
      headers: { "Content-Type": "application/json" },
      tags: { name: "05_PostRating" },
    };

    const ratingRes = http.post(
      `${BASE_URL}/api/ratings`,
      ratingPayload,
      ratingParams,
    );

    // Final Validation
    const ratingOk = check(ratingRes, {
      "Rating status 201": (r) => r.status === 201,
      "Rating response confirmed": (r) => r.body.includes("id"),
    });

    if (!ratingOk) {
      console.error(
        `[ERROR] Rating failed for Pizza ${pizzaId}. Status: ${ratingRes.status}`,
      );
    } else {
      console.log(`[FINAL] Successfully rated pizza ${pizzaId} with 5 stars.`);
    }

    sleep(randomIntBetween(1, 2));
  });
}
