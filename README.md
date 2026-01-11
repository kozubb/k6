# k6 Performance Testing Suite: QuickPizza API

This repository contains a performance testing script for the **QuickPizza** application, built using **k6**. The suite is designed to simulate realistic user behavior, including stateful authentication, CSRF protection handling, and complex business logic transactions.

## 🚀 Current Implementation: E2E User Journey

The core script executes a **User Journey** that validates both system stability and functional correctness under load:

1.  **Stateful Authentication Flow**:
    - **CSRF Handshake**: Dynamically retrieves tokens via POST requests.
    - **Session Management**: Authenticates users and injects session tokens into the `CookieJar` for subsequent stateful API calls.
    - **Authorization Check**: Verifies session persistence by accessing protected endpoints.
2.  **Business Logic Execution**:
    - **Dynamic Resource Discovery**: Requests pizza suggestions based on specific dietary and technical constraints.
    - **Data Chaining**: Extracts dynamic IDs from API responses to verify flow.

## 🛠 Configuration & Quality Gates

The suite utilizes **Performance Budgets (Thresholds)**:

- **Error Rate**: `http_req_failed < 1%` (Ensures 99% of requests are successful).
- **Latency**: `http_req_duration (p95) < 500ms` (Ensures high responsiveness for the vast majority of users).

### Running the Tests

To run the script locally, ensure you have **k6 installed** and execute:

k6 run main_test.js
