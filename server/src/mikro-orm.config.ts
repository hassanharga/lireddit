import { MikroORM } from '@mikro-orm/core';
import { __prod__, db } from './constants';
import { Post } from './entities/Post.entity';
import path from 'path';
import { User } from './entities/User.entity';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: db.dbName,
  type: db.type,
  user: db.user,
  password: db.password,
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
