FROM mhart/alpine-node:8.4

RUN apk update && apk upgrade && apk add git && apk add python && apk add make && apk add g++

RUN mkdir -p /usr/src/rpc
ADD . /usr/src/rpc

WORKDIR /usr/src/rpc
RUN yarn

CMD yarn rpc