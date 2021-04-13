import { Post } from '../entities/Post.entity';
import { MyContext } from '../types';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';

@Resolver()
export class PostResolver {
  // get all posts
  @Query(() => [Post])
  async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    // await sleep(3000);
    return await em.find(Post, {});
  }

  // get single posts
  @Query(() => Post, { nullable: true })
  async post(
    @Arg('id') id: number,
    @Ctx() { em }: MyContext,
  ): Promise<Post | null> {
    return await em.findOne(Post, { id });
  }

  // create  post
  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { em }: MyContext,
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  // update  post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string,
    @Ctx() { em }: MyContext,
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) return null;
    if (title) {
      post.title = title;
      await em.persistAndFlush(post);
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
