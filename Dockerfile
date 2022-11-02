FROM hub.lumigame.com/docker-hub/library/node:18.1-alpine

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV
RUN mkdir /app && chown node:node /app

WORKDIR /app
COPY package.json yarn.lock ./
RUN npm run reg
RUN yarn install --production
ENV PATH /app/node_modules/.bin:$PATH

USER node

COPY ./src/ .
HEALTHCHECK --interval=10s CMD node --es-module-specifier-resolution=node healthcheck.js

CMD [ "node", "--es-module-specifier-resolution=node", "./app.js" ]
