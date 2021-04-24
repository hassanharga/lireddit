export const __prod__ = process.env.NODE_ENV === 'production';

export const port = process.env.PORT || 3001;

export const db = {
  dbName: 'lireddit',
  type: 'postgresql',
  user: 'postgres',
  password: 'root',
};

export const sessionKey = 'hassan';
export const maxAge = 1000 * 60 * 60 * 24 * 365 * 10; // 10 years;
export const cookieName = 'qid';

export const origin = 'http://localhost:3000';
export const changePasswordUrl = `${origin}/change-password`;
export const changePasswordPrefix = 'change-password:';
export const changePasswordTokenExpireDate = 1000 * 60 * 60 * 24 * 3; // 3 days;

export const nodeMailerAuth = {
  user: 'pnmndrtfvgwmb3l3@ethereal.email',
  pass: 'SBEXXUWj8CxtRQnhd1',
};
