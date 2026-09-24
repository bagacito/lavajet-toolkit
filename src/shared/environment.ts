import { DefaultLoggingConfig, LoggedEnvironment, LoggingConfig, LoggingMode, LogLevel } from "@decaf-ts/logging";

import { LavajetConfig } from "../config/types";
import { FileContentFilter, PasswordFilter } from "./logging/filters";

export const DefaultSharedLavajetConfig: Pick<LavajetConfig, "env" | "lavajet"> & {
  blobs: { maxSize: number };
} & LoggingConfig = {
  env: "development",
  lavajet: {
    host: "localhost:3000",
    protocol: "http",
    basePublic: "public",
  },
  level: LogLevel.debug,
  logLevel: true,
  verbose: 3,
  format: LoggingMode.RAW,
  style: true,
  timestamp: true,
  contextSeparator: DefaultLoggingConfig.contextSeparator,
  pattern: DefaultLoggingConfig.pattern,
  separator: DefaultLoggingConfig.separator,
  context: true,
  filters: [new PasswordFilter(), new FileContentFilter()],
  blobs: {
    maxSize: 26214400,
  },
};

export const SharedEnvironment = LoggedEnvironment.accumulate(DefaultSharedLavajetConfig);
