import { LoggingConfig } from "@decaf-ts/logging";
import { MspDetails } from "@decaf-ts/for-fabric/shared";
import { TaskEngineAutoShutdownConfig } from "@decaf-ts/core";
import { InfrastructureConfig } from "../admin/InfrastructureConfig";

export type ResolverOwnerConfig = {
  protocol: string;
  host: string;
  path?: string;
  headers?: Record<string, string>;
};

/**
 * @description Application configuration type
 * @summary Extends LoggingConfig with server, database, and vendor-specific configuration options
 * @typedef PTPConfig
 * @memberOf module:toolkit
 */
export type LavajetConfig = LoggingConfig & {
  level: string;
  orgName: string;
  orgDomain: string;
  serviceUser: string;
  serviceAccount: string;
  projectShort: string;
  projectLong: string;
  app: string;
  lavajet: {
    host: string;
    protocol: string;
    basePublic: string;
  };
  timePerCall: number;
  totalWaitTime: number;
  database: {
    postgres?: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
      /**
       * Whether the TypeORM adapter may create/alter the schema at boot.
       * Defaults to true (bootstrap compatibility). Production/managed
       * deployments MUST set DATABASE__POSTGRES__SYNCHRONIZE=false -
       * schema changes belong exclusively to migrations.
       */
      synchronize?: boolean;
    };
  };
  cors: {
    enabled: boolean;
    origins: string;
  };
  jwt: {
    secretKey: string;
    expiry: string;
  };
  throttling: {
    enabled: boolean;
    defaultTtlMs: number;
    defaultLimit: number;
    publicTtlMs: number;
    publicLimit: number;
  };
  validation: {
    gtin: boolean;
  };
  resolver: {
    cronTime: {
      long: string;
      short: string;
    };
  };
  storage: {
    location: string;
  };
  https: {
    ignoreErrors: boolean;
  };
};
