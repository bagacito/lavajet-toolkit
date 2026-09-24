import { Environment, SharedEnvironment, DefaultPTPConfig } from "../../src/index";
import { PasswordFilter, FileContentFilter } from "../../src/shared/logging/filters";

const ENV_KEYS = [
  "APP",
  "ENV",
  "LAVAJET",
  "LAVAJET__HOST",
  "LAVAJET__PROTOCOL",
  "LAVAJET__BASE_PUBLIC",
  "LAVAJET__NEW_KEY",
  "LAVAJET__NESTED__DEEP",
  "DATABASE__POSTGRES__PORT",
  "DATABASE__POSTGRES__SYNCHRONIZE",
  "TIME_PER_CALL",
  "CORS__ENABLED",
  "THROTTLING__DEFAULT_LIMIT",
  "THROTTLING__DEFAULT_TTL_MS",
  "JWT__SECRET_KEY",
  "STORAGE__LOCATION",
  "CUSTOM_KEY",
  "myConfig__value",
  "MY_CONFIG__VALUE",
] as const;

describe("environment", () => {
  const snapshot: Record<string, string | undefined> = {};

  beforeAll(() => {
    ENV_KEYS.forEach((key) => (snapshot[key] = process.env[key]));
  });

  afterAll(() => {
    Object.entries(snapshot).forEach(([key, value]) => {
      if (typeof value === "undefined") delete process.env[key];
      else process.env[key] = value;
    });
  });

  beforeEach(() => {
    ENV_KEYS.forEach((key) => {
      delete process.env[key];
    });
  });

  it("exposes the accumulated default configuration", () => {
    expect(DefaultPTPConfig.app).toBe("lavajet");
    expect(SharedEnvironment.app).toBe("lavajet");
    expect(SharedEnvironment.env).toBe("development");
    expect(SharedEnvironment.lavajet.host).toBe("localhost:3000");
    expect(SharedEnvironment.lavajet.protocol).toBe("http");
    expect(SharedEnvironment.lavajet.basePublic).toBe("public");
    expect(SharedEnvironment.database.postgres.port).toBe(5432);
    expect(SharedEnvironment.timePerCall).toBe(10_000);
    expect(SharedEnvironment.totalWaitTime).toBe(60_000);
    expect(SharedEnvironment.jwt.expiry).toBe("5m");
    expect(SharedEnvironment.cors.enabled).toBe(true);
    expect(SharedEnvironment.throttling.defaultLimit).toBe(100);
    expect(SharedEnvironment.resolver.cronTime.long).toBe("0 */20 * * * *");
    expect(SharedEnvironment.storage.location).toBeUndefined();
    expect(SharedEnvironment.https.ignoreErrors).toBe(true);
    expect(SharedEnvironment.blobs.maxSize).toBe(26_214_400);
  });

  it("picks up runtime environment changes for flat keys", () => {
    process.env.APP = "otherapp";
    expect(SharedEnvironment.app).toBe("otherapp");
  });

  it("falls back to the seeded value when the environment variable is absent", () => {
    expect(SharedEnvironment.app).toBe("lavajet");
  });

  it("picks up runtime changes for nested keys", () => {
    process.env.LAVAJET__HOST = "localhost:8000";
    expect(SharedEnvironment.lavajet.host).toBe("localhost:8000");
    expect(SharedEnvironment.lavajet.protocol).toBe("http");
  });

  it("picks up runtime changes for keys that are not part of the model", () => {
    process.env.LAVAJET__NEW_KEY = "injected";
    expect(SharedEnvironment.lavajet.newKey).toBe("injected");
  });

  it("picks up runtime changes for deep paths not present in the model", () => {
    process.env.LAVAJET__NESTED__DEEP = "deep-value";
    expect(SharedEnvironment.lavajet.nested.deep).toBe("deep-value");
  });

  it("falls back to the raw (unformatted) env key when the formatted key is absent", () => {
    process.env["myConfig__value"] = "raw-value";
    expect(SharedEnvironment.myConfig.value).toBe("raw-value");
  });

  it("parses boolean and numeric runtime values", () => {
    process.env.CORS__ENABLED = "true";
    expect(SharedEnvironment.cors.enabled).toBe(true);
    process.env.DATABASE__POSTGRES__SYNCHRONIZE = "false";
    expect(SharedEnvironment.database.postgres.synchronize).toBe(false);
    process.env.THROTTLING__DEFAULT_LIMIT = "250";
    expect(SharedEnvironment.throttling.defaultLimit).toBe(250);
    process.env.THROTTLING__DEFAULT_TTL_MS = "1.5";
    expect(SharedEnvironment.throttling.defaultTtlMs).toBe(1.5);
  });

  it("parses negative, padded and non-numeric runtime values", () => {
    process.env.TIME_PER_CALL = "-5";
    expect(SharedEnvironment.timePerCall).toBe(-5);
    process.env.TIME_PER_CALL = "  42  ";
    expect(SharedEnvironment.timePerCall).toBe(42);
    process.env.TIME_PER_CALL = "not-a-number";
    expect(SharedEnvironment.timePerCall).toBe("not-a-number");
  });

  it("overrides the env key through the ENV variable", () => {
    process.env.ENV = "production";
    expect(SharedEnvironment.env).toBe("production");
  });

  it("composes ENV keys for paths outside the model", () => {
    expect(String(SharedEnvironment.myConfig)).toBe("MY_CONFIG");
    expect(String(SharedEnvironment.myConfig.value)).toBe("MY_CONFIG__VALUE");
  });

  it("returns undefined for empty string values in the model outside orThrow", () => {
    expect(SharedEnvironment.jwt.secretKey).toBeUndefined();
  });

  it("returns empty strings set in the runtime environment", () => {
    process.env.LAVAJET__PROTOCOL = "";
    expect(SharedEnvironment.lavajet.protocol).toBe("");
  });

  it("supports flat assignments on the environment object", () => {
    SharedEnvironment.timePerCall = 123;
    expect(SharedEnvironment.timePerCall).toBe(123);
    SharedEnvironment.timePerCall = 10_000;
    process.env.JWT__SECRET_KEY = "assigned";
    expect(SharedEnvironment.jwt.secretKey).toBe("assigned");
  });

  it("supports put and remove for dynamic keys", () => {
    SharedEnvironment.put("customKey", "custom-value");
    expect(SharedEnvironment.customKey).toBe("custom-value");
    process.env.CUSTOM_KEY = "env-value";
    expect(SharedEnvironment.customKey).toBe("env-value");
    delete process.env.CUSTOM_KEY;
    SharedEnvironment.remove("customKey");
    expect(Object.prototype.hasOwnProperty.call(SharedEnvironment, "customKey")).toBe(false);
    expect(String(SharedEnvironment.customKey)).toBe("CUSTOM_KEY");
  });

  it("exposes accumulated keys through the instance helpers", () => {
    const keys = Environment.keys();
    expect(keys).toContain("app");
    expect(keys).toContain("lavajet");
    expect(keys).toContain("database");
    expect(Environment.get("app")).toBe("lavajet");
    expect(() => Environment.get("doesNotExist")).toThrow(/does not exist/);
  });

  it("keeps array models accessible", () => {
    expect(SharedEnvironment.filters.length).toBe(2);
    expect(SharedEnvironment.filters[0]).toBeInstanceOf(PasswordFilter);
    expect(SharedEnvironment.filters[1]).toBeInstanceOf(FileContentFilter);
  });

  it("masks passwords through the configured filter", () => {
    const filter = SharedEnvironment.filters[0] as PasswordFilter;
    const filtered = filter.filter({} as never, `{"password": "hunter2"}`, []);
    expect(filtered).toBe(`{"password": ${new Array("hunter2".length).fill("*").join("")}}`);
    expect(filter.filter({} as never, "no secret here", [])).toBe("no secret here");
  });

  it("truncates file contents through the configured filter", () => {
    const filter = SharedEnvironment.filters[1] as FileContentFilter;
    const filtered = filter.filter({} as never, `"content": "0123456789ABCDEF"`, []);
    expect(filtered).toBe(`"content": "01234...ABCDEF"`);
    expect(filter.filter({} as never, "nothing to truncate", [])).toBe("nothing to truncate");
  });

  describe("orThrow", () => {
    it("resolves seeded values and runtime overrides", () => {
      expect(SharedEnvironment.orThrow().lavajet.host).toBe("localhost:3000");
      process.env.LAVAJET__HOST = "localhost:8000";
      expect(SharedEnvironment.orThrow().lavajet.host).toBe("localhost:8000");
      expect(SharedEnvironment.orThrow().database.postgres.port).toBe(5432);
      expect(SharedEnvironment.orThrow().app).toBe("lavajet");
    });

    it("throws for empty required values in the model", () => {
      expect(() => SharedEnvironment.orThrow().jwt.secretKey).toThrow(
        "Environment variable JWT__SECRET_KEY is required but was undefined."
      );
      process.env.JWT__SECRET_KEY = "secret";
      expect(SharedEnvironment.orThrow().jwt.secretKey).toBe("secret");
      expect(() => SharedEnvironment.orThrow().storage.location).toThrow(
        "Environment variable STORAGE__LOCATION is required but was undefined."
      );
      process.env.STORAGE__LOCATION = "/tmp/storage";
      expect(SharedEnvironment.orThrow().storage.location).toBe("/tmp/storage");
    });

    it("throws for unknown properties in nested models", () => {
      expect(() => SharedEnvironment.orThrow().lavajet.missing).toThrow(
        "Environment variable LAVAJET__MISSING is required but was undefined."
      );
    });

    it("does not throw for unknown root properties, returning a key composition proxy", () => {
      expect(String(SharedEnvironment.orThrow().unknownProp)).toBe("UNKNOWN_PROP");
    });

    it("throws for empty strings set in the runtime environment", () => {
      process.env.LAVAJET__PROTOCOL = "";
      expect(() => SharedEnvironment.orThrow().lavajet.protocol).toThrow(
        "Environment variable LAVAJET__PROTOCOL is required but was an empty string."
      );
    });

    it("serializes nested models through JSON", () => {
      const parsed = JSON.parse(JSON.stringify(SharedEnvironment.orThrow().lavajet));
      expect(parsed).toEqual({
        host: "localhost:3000",
        protocol: "http",
        basePublic: "public",
      });
    });
  });
});
