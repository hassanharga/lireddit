import express from 'express';
import i18n from 'i18n';
import cors from 'cors';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { sessionKey, maxAge, __prod__, origin, cookieName } from '../constants';

const RedisStore = connectRedis(session);
export const redis: any = new Redis();

const app = express();

i18n.configure({
  queryParameter: 'lang',
  locales: ['en', 'ar'],
  directory: `${__dirname}/../../locales`,
  syncFiles: true,
  objectNotation: true,
});

app.use(
  cors({
    origin,
    credentials: true,
  }),
);
app.use(i18n.init);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    name: cookieName,
    store: new RedisStore({ client: redis, disableTouch: true }),
    saveUninitialized: false,
    cookie: {
      maxAge,
      httpOnly: true,
      sameSite: 'lax', // related to csrf
      secure: __prod__, // will work only in https,
    },
    resave: false,
    secret: sessionKey,
  }),
);

export default app;
