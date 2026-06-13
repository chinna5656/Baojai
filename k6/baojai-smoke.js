import http from "k6/http";
import { check, group, sleep } from "k6";
import { Trend } from "k6/metrics";

const BASE_URL = (__ENV.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const INCLUDE_CHAT = __ENV.INCLUDE_CHAT === "1";

const pageDuration = new Trend("baojai_page_duration", true);
const apiDuration = new Trend("baojai_api_duration", true);

export const options = {
  stages: [
    { duration: "20s", target: 5 },
    { duration: "40s", target: 10 },
    { duration: "20s", target: 0 }
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<1500"],
    baojai_page_duration: ["p(95)<1500"],
    baojai_api_duration: ["p(95)<2500"]
  }
};

function expectOkOrRedirect(response, name) {
  return check(response, {
    [`${name} status is ok or redirect`]: (res) => [200, 302, 307, 308].includes(res.status),
    [`${name} has body`]: (res) => Boolean(res.body && res.body.length > 0)
  });
}

function getPage(path, name) {
  const response = http.get(`${BASE_URL}${path}`, {
    tags: { type: "page", name }
  });

  pageDuration.add(response.timings.duration, { name });
  expectOkOrRedirect(response, name);
  return response;
}

function getApi(path, name) {
  const response = http.get(`${BASE_URL}${path}`, {
    tags: { type: "api", name }
  });

  apiDuration.add(response.timings.duration, { name });
  expectOkOrRedirect(response, name);
  return response;
}

export default function runBaojaiSmokeTest() {
  group("public pages", () => {
    getPage("/", "home");
    getPage("/login", "login");
    getPage("/register", "register");
  });

  group("app pages", () => {
    getPage("/dashboard", "dashboard");
    getPage("/meal-plan", "meal-plan");
    getPage("/glucose", "glucose");
    getPage("/food-log", "food-log");
    getPage("/settings", "settings");
  });

  group("lightweight api", () => {
    getApi("/api/chat", "chat-status");
  });

  if (INCLUDE_CHAT) {
    group("ollama chat api", () => {
      const response = http.post(
        `${BASE_URL}/api/chat`,
        JSON.stringify({ message: "ช่วยแนะนำมื้อกลางวันที่น้ำตาลไม่สูง" }),
        {
          headers: { "Content-Type": "application/json" },
          tags: { type: "api", name: "chat-post" },
          timeout: "130s"
        }
      );

      apiDuration.add(response.timings.duration, { name: "chat-post" });
      check(response, {
        "chat-post status is ok": (res) => res.status === 200,
        "chat-post returns reply": (res) => {
          try {
            return Boolean(res.json("reply"));
          } catch {
            return false;
          }
        }
      });
    });
  }

  sleep(1);
}
