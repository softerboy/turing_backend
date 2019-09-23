FROM node:10

MAINTAINER Fakhriddin Umarov <fn.umarov@gmail.com>

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

CMD yarn dev

EXPOSE $PORT
