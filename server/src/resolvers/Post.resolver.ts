import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post.entity';
import { Updoot } from '../entities/Updoot.entiny';
import { isAuth } from '../middlewares/isAuth';
import { MyContext } from '../types';

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  // this is gonna called every time we have post object
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext,
  ) {
    const { userId } = req.session;
    const realValue = value === -1 ? -1 : 1;

    const updoot = await Updoot.findOne({ where: { postId, userId } });
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (t) => {
        await t.query(
          `
          UPDATE updoot
          SET value = $1
          WHERE "postId" = $2 AND "userId" = $3;
        `,
          [realValue, postId, userId],
        );

        await t.query(
          `
          UPDATE post
          SET points = points + $1
          WHERE id = $2;
        `,
          [2 * realValue, postId],
        );
      });
    } else if (!updoot) {
      await getConnection().transaction(async (t) => {
        await t.query(
          `
          INSERT INTO updoot ("userId", "postId", value)
          VALUES ($1, $2, $3);
        `,
          [userId, postId, realValue],
        );

        await t.query(
          `
            UPDATE post
            SET points = points + $1
            WHERE id = $2;
        `,
          [realValue, postId],
        );
      });
    }
    return true;
  }

  // get all posts
  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext,
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const { userId } = req.session;
    const replacements: any[] = [realLimitPlusOne];
    if (userId) {
      replacements.push(userId);
    }
    let cursorIdx = 3;
    if (cursor) {
      replacements.push(new Date(+cursor));
      cursorIdx = replacements.length;
    }

    const posts = await getConnection().query(
      `
      SELECT p.*,
      json_build_object(
        'id',  u.id,
        'username',  u.username,
        'email',  u.email
        ) creator,
      ${
        userId
          ? `(
              SELECT value 
              FROM updoot
              WHERE "userId" = $2 AND "postId" = p.id
            ) "voteStatus"`
          : `null as "voteStatus"`
      }
      FROM post p
      INNER JOIN public.user u on u.id = p."creatorId"
      ${cursor ? ` where p."createdAt" < $${cursorIdx}` : ''}
      ORDER BY p."createdAt" DESC 
      LIMIT $1
    `,
      replacements,
    );

    // const query = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder('p')
    //   .innerJoin('p.creator', 'u', 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', 'DESC')
    //   .take(realLimitPlusOne);

    // if (cursor) {
    //   query.where('p."createdAt" < :cursor', { cursor: new Date(+cursor) });
    // }

    // const posts = await query.getMany();
    // console.log(`posts`, posts);
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  // get single posts
  @Query(() => Post, { nullable: true })
  async post(@Arg('id') id: number): Promise<Post | undefined> {
    return await Post.findOne(id);
  }

  // create  post
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('payload') { title, text }: PostInput,
    @Ctx() { req }: MyContext,
  ): Promise<Post> {
    return await Post.create({
      creatorId: req.session.userId,
      title,
      text,
    }).save();
  }

  // update  post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) return null;
    if (title) {
      post.title = title;
      await post.save();
      // await Post.update({ id }, { title });
    }
    return post;
  }

  // delete  post
  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
