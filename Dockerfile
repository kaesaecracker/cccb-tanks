FROM node:current-alpine

COPY package.json /app/
COPY package-lock.json /app/
WORKDIR /app/

RUN npm i

COPY src /app/

ENTRYPOINT ["/usr/local/bin/node", "host.js"]
EXPOSE 3000
