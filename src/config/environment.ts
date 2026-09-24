import { LavajetConfig } from "./types";
import { SharedEnvironment as SharedEnvironment } from "../shared/environment";

export const DefaultLavajetConfig: LavajetConfig = {
  app: "lavajet",
  env: "development",
  level: "debug",
  projectShort: "LJ",
  projectLong: "PharmaLedger™ Trusted Partner Program",
  serviceUser: "service.account",
  serviceAccount: "service.account@pharmaledgerassoc.ptp.internal",
  lavajet: {
    host: "localhost:3000",
    protocol: "http",
    basePublic: "public",
  },
  timePerCall: 10_000,
  totalWaitTime: 60_000,
  database: {
    postgres: {
      host: "postgres", //TODO - for demo
      port: 5432,
      database: "",
      user: "",
      password: "",
      // env: DATABASE__POSTGRES__SYNCHRONIZE - false in production/managed
      // deployments; schema changes belong exclusively to migrations
      synchronize: true,
    },
  },
  cors: {
    enabled: true,
    origins: "*",
  },
  jwt: {
    secretKey: "",
    expiry: "5m",
  },
  throttling: {
    enabled: true,
    defaultTtlMs: 60000,
    defaultLimit: 100,
    publicTtlMs: 1000,
    publicLimit: 20,
  },
  resolver: {
    cronTime: {
      long: "0 */20 * * * *",
      short: "0 */10 * * * *",
    },
  },
  storage: {
    location: "",
  },
  https: {
    ignoreErrors: true,
  },
} as unknown as LavajetConfig;

export const Environment = SharedEnvironment.accumulate(DefaultLavajetConfig);
