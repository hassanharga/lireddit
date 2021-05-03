import { ApolloServer } from 'apollo-server-express';
import 'dotenv-safe/config';
import path from 'path';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { port } from './constants';
import { Post } from './entities/Post.entity';
import { Updoot } from './entities/Updoot.entiny';
import { User } from './entities/User.entity';
import { PostResolver } from './resolvers/Post.resolver';
import { UserResolver } from './resolvers/User.resolver';
import app, { redis } from './services/express';
import { createUpdootLoader } from './utils/createUpdootLoader';
import { createUserLoader } from './utils/createUserLoader';

// main function
const main = async () => {
  // connect to DB
  const conn = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    // logging: true,
    // synchronize: true,
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
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
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
