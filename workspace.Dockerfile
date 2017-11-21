FROM mhart/alpine-node:8.5

RUN apk update && apk upgrade && apk add git && apk add python && apk add make && apk add g++

RUN npm i -g truffle@4.0.1
VOLUME /usr/src/workspace
WORKDIR /usr/src/workspace
