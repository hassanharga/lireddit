import { MyContext } from '../types';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { User } from '../entities/User.entity';
import { decryptData, encryptData } from '../utils/encrypt';
import { __ } from 'i18n';
import {
  cookieName,
  changePasswordPrefix,
  changePasswordUrl,
  changePasswordTokenExpireDate,
} from '../constants';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';

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

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // show users their only emails
    if (req.session.userId === user.id) {
      return user.email;
    }
    return '';
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext,
  ): Promise<UserResponse> {
    // check for password length
    if (newPassword.length < 2) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: __('error.password.length', { number: '2' }),
          },
        ],
      };
    }

    const userId = await redis.get(changePasswordPrefix + token);
    // console.log(`user from redis`, userId);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: __('error.token.inValid'),
          },
        ],
      };
    }

    const user = await User.findOne(+userId);
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: __('error.token.notExist'),
          },
        ],
      };
    }
    user.password = await encryptData(newPassword);
    await user.save();
    // login user after change password
    req.session.userId = user.id;
    // remove key from redis
    await redis.del(changePasswordPrefix + token);
    return { user };
  }

  @Mutation(() => Boolean)
  async forgetPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext,
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // email is not in the DB
      return false;
    }

    // create <a> tag
    // <a href="http://localhost:3000/change-password/:token">reset password</a>
    // store token in redis
    const token = v4();
    await redis.set(
      changePasswordPrefix + token,
      user.id,
      'ex',
      changePasswordTokenExpireDate,
    );
    await sendEmail(
      email,
      `<a href="${changePasswordUrl}/${token}">reset password</a>`,
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | undefined | null> {
    if (!req.session.userId) {
      return null;
    }
    const user = await User.findOne(req.session.userId);
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('payload') payload: UsernamePasswordInput,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    // validate payload
    const errors = validateRegister(payload);
    if (errors) {
      return { errors };
    }

    // hash password
    const hashedPassword = await encryptData(payload.password);
    const user = User.create({
      username: payload.username,
      password: hashedPassword,
      email: payload.email,
    });
    try {
      await user.save();
    } catch (error) {
      // console.error('err[register]', error);
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
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    if (!password || !usernameOrEmail) {
      return {
        errors: [{ field: 'params', message: __('error.params.missing') }],
      };
    }

    const user = await User.findOne({
      where: usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    });
    if (!user) {
      return {
        errors: [
          { field: 'usernameOrEmail', message: __('error.username.notExists') },
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
