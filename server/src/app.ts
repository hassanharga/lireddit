import 'reflect-metadata';
import { port, typeOrmConfig } from './constants';
import app, { redis } from './services/express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/Post.resolver';
import { UserResolver } from './resolvers/User.resolver';
import { createConnection } from 'typeorm';
import { User } from './entities/User.entity';
import { Post } from './entities/Post.entity';
import path from 'path';
import { Updoot } from './entities/Updoot.entiny';

// main function
const main = async () => {
  // connect to DB
  const conn = await createConnection({
    ...typeOrmConfig,
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [User, Post, Updoot],
  });

  await conn.runMigrations();
  // await Post.delete({});

  // run migrations
  // migration looking up in the DB and comparing it with the entities we have and make it match exactly and if it's not match it create sql to make it match

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
    context: ({ req, res }) => ({ req, res, redis }),
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
