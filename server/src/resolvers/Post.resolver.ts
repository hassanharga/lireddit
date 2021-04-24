import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Post } from '../entities/Post.entity';

@Resolver()
export class PostResolver {
  // get all posts
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    // await sleep(3000);
    return await Post.find();
  }

  // get single posts
  @Query(() => Post, { nullable: true })
  async post(@Arg('id') id: number): Promise<Post | undefined> {
    return await Post.findOne(id);
  }

  // create  post
  @Mutation(() => Post)
  async createPost(@Arg('title') title: string): Promise<Post> {
    return await Post.create({ title }).save();
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
