/// <reference types="node" />

// Declare env variables here.

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PORT: number;
  }
}
