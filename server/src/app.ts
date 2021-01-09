import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { port } from './constants';
import mikroConfig from './mikro-orm.config';
import app from './services/express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/Post.resolver';
import { UserResolver } from './resolvers/User.resolver';

// main function
const main = async () => {
  // coneect to DB
  const orm = await MikroORM.init(mikroConfig);

  // run migrations
  // migration looking up in the DB and comparing it with the entities we have and make it match exactly and if it's not match it create sql to make it match
  await orm.getMigrator().up();

  // init express
  // const app = serverExpress;

  // init apollo server (graphql)
  const apolloServer = new ApolloServer({
    // graphql schema
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    // context is special object that is accessible for all resolvers
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`\n\n =======> server is running at port ${port} <=======\n\n`);
  });
};

main().catch((err) => {
  console.error('err[main]', err);
});
