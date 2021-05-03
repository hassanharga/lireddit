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
import { User } from '../entities/User.entity';
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

  // when we use that it will get the data correctly
  // but it will run it with every single post
  // so we will user dataloader library
  @FieldResolver(() => User)
  async creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    // return await User.findOne(post.creatorId);
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { updootLoader, req }: MyContext,
  ) {
    if (!req.session.userId) {
      return null;
    }
    const updoot = await updootLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });
    return updoot ? updoot.value : null;
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
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(+cursor));
    }

    const posts = await getConnection().query(
      `
      SELECT p.*
      FROM post p
      ${cursor ? ` where p."createdAt" < $2` : ''}
      ORDER BY p."createdAt" DESC 
      LIMIT $1
    `,
      replacements,
    );

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  // get single posts
  @Query(() => Post, { nullable: true })
  async post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Arg('text', () => String, { nullable: true }) text: string,
    @Ctx() { req }: MyContext,
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) return null;
    if ((title || text) && post.creatorId === req.session.userId) {
      post.title = title;
      post.text = text;
      await post.save();
      // await Post.update({ id }, { title, text });
    }

    return post;
  }

  // delete post
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext,
  ): Promise<boolean> {
    const userId = req.session.userId;

    // cascade way
    // await Post.delete({ id, creatorId: userId });

    const post = await Post.findOne(id);
    if (!post) {
      return false;
    }
    if (post.creatorId !== userId) {
      throw new Error('not authorized');
    }

    await post.remove();

    // not cascade way
    // await Updoot.delete({ postId: id });
    // await Post.delete({ id });
    return true;
  }
}
