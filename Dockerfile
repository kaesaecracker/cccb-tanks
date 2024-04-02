FROM node:current-alpine AS build

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

# client build
COPY client /app/client
WORKDIR /app/client
RUN npm run build

# server build
COPY server /app/server
WORKDIR /app/server
RUN npm run build

FROM node:current-alpine AS runtime
COPY --from=build /app/dist /app

WORKDIR /app/
ENTRYPOINT ["/usr/local/bin/node", "host.js"]
EXPOSE 3000
