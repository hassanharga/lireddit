import { MyContext } from '../types';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { User } from '../entities/User.entity';
import { decryptData, encryptData } from '../utils/encrypt';
import { __ } from 'i18n';
import { cookieName } from '../constants';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User | null;
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgetPassword(@Arg('email') email: string, @Ctx() { em }: MyContext) {
    await em.findOne(User, { email });
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('payload') payload: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    // validate payload
    const errors = validateRegister(payload);
    if (errors) {
      return { errors };
    }

    // hash password
    const hashedPassword = await encryptData(payload.password);
    const user = em.create(User, {
      username: payload.username,
      password: hashedPassword,
      email: payload.email,
    });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      console.error('err[register]', error.message);
      //  || error.detail.includes('already exists')
      if (error.code === '23505') {
        return {
          errors: [{ field: 'username', message: __('error.username.exists') }],
        };
      }
    }
    // set session for user
    // keep user loggen in
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContext,
  ): Promise<UserResponse> {
    if (!password || !usernameOrEmail) {
      return {
        errors: [{ field: 'params', message: __('error.params.missing') }],
      };
    }

    const user = await em.findOne(
      User,
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    );
    if (!user) {
      return {
        errors: [
          { field: 'username', message: __('error.username.notExists') },
        ],
      };
    }

    const valid = await decryptData(user.password, password);
    if (!valid) {
      return {
        errors: [{ field: 'password', message: __('error.password.wrong') }],
      };
    }
    req.session.userId = user.id;
    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err: any) => {
        if (err) {
          console.log('err[logout]', err);
          resolve(false);
          return;
        }
        res.clearCookie(cookieName);
        resolve(true);
      }),
    );
  }
}
