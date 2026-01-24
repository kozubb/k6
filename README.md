# k6 Performance Testing Suite: QuickPizza API

This repository contains a **performance testing suite** for the **QuickPizza** application, built using **k6**.  
The suite simulates realistic user behavior, including stateful authentication, CSRF token handling, and complex business logic transactions.

---

## 🚀 1. Full User Journey

The core script executes a **Full User Journey**, validating both system stability and functional correctness under load.

### Steps:

1. **Stateful Authentication Flow**
   - **CSRF Handshake**: Dynamically retrieves tokens via POST requests.
   - **Session Management**: Authenticates users and stores session tokens automatically for subsequent stateful API calls.
   - **Authorization Check**: Verifies session persistence by accessing protected endpoints.

2. **Business Logic Execution**
   - **Dynamic Resource Discovery**: Requests pizza suggestions or ratings based on specific constraints.
   - **Data Chaining**: Extracts dynamic IDs from API responses to validate the flow end-to-end.

> This script simulates a realistic user performing multiple sequential actions, ideal for **full system load and functional testing**.

---

## 🔑 2. Login Flow Using JSON Data

A second script focuses only on **logging in users from a JSON file**, useful for **auth performance and baseline load testing**.

### JSON File Format

Create a `users.json` file:

{
"users": [
{ "username": "user1@test.com", "password": "pass123" },
{ "username": "user2@test.com", "password": "pass123" },
{ "username": "user3@test.com", "password": "pass123" }
]
}

**Flow:**

Each Virtual User (VU) is assigned a unique user from the JSON file.

Only the login flow and protected endpoint check are executed — no full user journey.

1:1 mapping between VU and user ensures no session conflicts.

## 🛠 Configuration & Quality Gates

The suites utilizes **Performance Budgets (Thresholds)**

- **Error Rate**: `http_req_failed < 1%` (Ensures 99% of requests are successful).
- **Latency**: `http_req_duration (p95) < 500ms` (Ensures high responsiveness for the vast majority of users).
- **Tags checking**: `http_req_duration (p95)` per every tag (Ensures that specific page meets requirements ).

### Running the Tests

To run the scripts locally, ensure you have **k6 installed** and execute:

k6 run quickPizza-testScript.js

k6 run loginDataFromJSON.js
