import { cacheExchange } from '@urql/exchange-graphcache';
import Router from 'next/router';
import { dedupExchange, Exchange, fetchExchange } from 'urql';
import { pipe, tap } from 'wonka';
import routes from '../constants/routes';
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from '../generated/graphql';
import { betterUpdatequery } from './betterUpdatequery';

// handle error globally
const errorExchange: Exchange = ({ forward }) => ($ops) => {
  return pipe(
    forward($ops),
    tap(({ error }) => {
      if (error?.message.includes('not authenticated')) {
        Router.replace(routes.LOGIN);
      }
    })
  );
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:3001/graphql',
  fetchOptions: {
    credentials: 'include' as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logout: (result, _args, cache, _info) => {
            betterUpdatequery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              () => ({
                me: null,
              })
            );
          },
          login: (result, _args, cache, _info) => {
            betterUpdatequery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              (res, qu) => {
                if (res.login.errors) {
                  return qu;
                }
                return {
                  me: res.login.user,
                };
              }
            );
          },
          register: (result, _args, cache, _info) => {
            betterUpdatequery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              result,
              (r, q) => {
                if (r.register.errors) {
                  return q;
                }
                return {
                  me: r.register.user,
                };
              }
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
