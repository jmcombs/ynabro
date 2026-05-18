import { describe, expect, it } from "vitest";
import { FileBasedCache, InMemoryCache, YnabroClient } from "../src/index.js";

describe("YnabroClient", () => {
  it("should track requests and report rate limit status", () => {
    const client = new YnabroClient("fake-token");
    const status1 = client.getRateLimitStatus();
    expect(status1.limit).toBe(200);
    expect(status1.used).toBe(0);
  });

  it("should support pluggable cache stores", async () => {
    const cache = new InMemoryCache();
    const client = new YnabroClient("fake-token", cache);
    expect(client).toBeDefined();
  });

  it("should allow FileBasedCache for portability", async () => {
    const cache = new FileBasedCache();
    const client = new YnabroClient("fake-token", cache);
    expect(client).toBeDefined();
  });
});
