declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    REDIS: string;
    PORT: string;
    SESSION_SECRET: string;
    ORIGIN: string;
  }
}