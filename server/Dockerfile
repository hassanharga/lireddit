FROM node:14

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY yarn.lock ./

RUN yarn
RUN yarn build
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
COPY .env.production .env

ENV NODE_ENV=production

EXPOSE 8080
CMD [ "node", "dist/app.js" ]
USER node