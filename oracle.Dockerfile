FROM mhart/alpine-node:8.4

RUN apk update && apk upgrade && apk add git && apk add python && apk add make && apk add g++
RUN mkdir -p /usr/src/bridge

RUN git clone https://github.com/oraclize/ethereum-bridge.git /usr/src/bridge

WORKDIR /usr/src/bridge
RUN npm i

CMD node bridge -a 5 -H rpc:8545