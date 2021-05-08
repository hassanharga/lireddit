import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import i18n from 'i18n';
import Redis from 'ioredis';
import { cookieName, maxAge, secret, __prod__ } from '../constants';

const RedisStore = connectRedis(session);
export const redis: any = new Redis(process.env.REDIS);

const app = express();

i18n.configure({
  queryParameter: 'lang',
  locales: ['en', 'ar'],
  directory: `${__dirname}/../../locales`,
  syncFiles: true,
  objectNotation: true,
});

// if we r using server like nginx we will set this
// app.set('proxy', 1);

app.use(
  cors({
    origin: process.env.ORIGIN,
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
    secret,
  }),
);

export default app;
