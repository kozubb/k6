import http from "k6/http";
import { check, sleep, group } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { SharedArray } from "k6/data";
import { randomItem } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

const userCredentials = new SharedArray("users with credentials", function () {
  return JSON.parse(open("./users.json")).users;
});

// Test configuration
export const options = {
  scenarios: {
    ten_users_once: {
      executor: "per-vu-iterations",
      vus: userCredentials.length,
      iterations: 1,
      maxDuration: "1m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
    "http_req_duration{name:00_GetCsrfToken}": ["p(95)<200"],
    "http_req_duration{name:01_LoginAction}": ["p(95)<500"],
    "http_req_duration{name:02_RatingsAfterLogin}": ["p(95)<250"],
  },
};

const BASE_URL = "https://quickpizza.grafana.com";

export default function () {
  const randomCredential = randomItem(userCredentials);

  let csrfToken;

  group("Authentication_Flow", function () {
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

    // Step 01: Login
    const loginPayload = JSON.stringify({
      username: randomCredential.username,
      password: randomCredential.password,
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
        tags: { name: "01_LoginAction" },
      },
    );

    const userToken = loginRes.json().token;

    check(loginRes, {
      "Login status is 200": (r) => r.status === 200,
      "User token received": () => userToken !== undefined,
    });

    // Step 02: Inject session cookie
    const jar = http.cookieJar();
    jar.set(BASE_URL, "qp_user_token", userToken, {
      domain: "quickpizza.grafana.com",
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "strict",
    });

    // Step 03: Verify if ratings page is displayed after login
    const ratingsRes = http.get(`${BASE_URL}/api/ratings`, {
      tags: { name: "02_RatingsAfterLogin" },
    });

    check(ratingsRes, {
      "Ratings accessible after login": (r) => r.status === 200,
    });

    sleep(randomIntBetween(1, 2));
  });
}
