FROM node:current-alpine

# client dependencies
COPY client/package.json /app/client/
COPY client/package-lock.json /app/client/
WORKDIR /app/client
RUN npm i

# server dependencies
COPY server/package.json /app/server/
COPY server/package-lock.json /app/server/
WORKDIR /app/server
RUN npm i

COPY client /app/client
WORKDIR /app/client
RUN npm run build

COPY server /app/server
WORKDIR /app/server
RUN npm run build

WORKDIR /app/dist
ENTRYPOINT ["/usr/local/bin/node", "host.js"]
EXPOSE 3000
