import { Post } from '../entities/Post.entity';
import { MyContext } from '../types';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';

// const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
@Resolver()
export class PostResolver {
  // get all posts
  @Query(() => [Post])
  async posts(@Ctx() ctx: MyContext): Promise<Post[]> {
    // await sleep(3000);
    return ctx.em.find(Post, {});
  }

  // get single posts
  @Query(() => Post, { nullable: true })
  post(@Arg('id') id: number, @Ctx() ctx: MyContext): Promise<Post | null> {
    return ctx.em.findOne(Post, { id });
  }

  // create  post
  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() ctx: MyContext,
  ): Promise<Post> {
    const post = ctx.em.create(Post, { title });
    await ctx.em.persistAndFlush(post);
    return post;
  }

  // update  post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string,
    @Ctx() ctx: MyContext,
  ): Promise<Post | null> {
    const post = await ctx.em.findOne(Post, { id });
    if (!post) return null;
    if (title) {
      post.title = title;
      await ctx.em.persistAndFlush(post);
    }
    return post;
  }

  // delete  post
  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: number,
    @Ctx() { em }: MyContext,
  ): Promise<boolean> {
    await em.nativeDelete(Post, { id });
    return true;
  }
}
