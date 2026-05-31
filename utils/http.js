import http from "k6/http";

export function get(url, name) {
  return http.get(url, {
    tags: { name },
  });
}

export function post(url, body, name) {
  return http.post(url, JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },

    tags: { name },
  });
}

export function put(url, body, name) {
  return http.put(url, JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },

    tags: { name },
  });
}

export function deleteMethod(url, name) {
  return http.del(url, {
    tags: { name },
  });
}
