import { dedupExchange, fetchExchange } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from '../generated/graphql';
import { betterUpdatequery } from './betterUpdatequery';

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
    ssrExchange,
    fetchExchange,
  ],
});
