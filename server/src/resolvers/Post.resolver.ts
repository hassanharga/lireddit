import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post } from '../entities/Post.entity';
import { isAuth } from '../middlewares/isAuth';

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}
@Resolver(Post)
export class PostResolver {
  // this is gonna called every time we have post object
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  // get all posts
  @Query(() => [Post])
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit);

    const query = getConnection()
      .getRepository(Post)
      .createQueryBuilder('p')
      .orderBy('"createdAt"', 'DESC')
      .take(realLimit);

    if (cursor) {
      query.where('"createdAt" < :cursor', { cursor: new Date(+cursor) });
    }
    return await query.getMany();
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
