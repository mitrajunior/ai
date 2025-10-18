FROM node:20-alpine
WORKDIR /app
COPY package.json /app/package.json
RUN npm install --no-audit --no-fund
COPY server.mjs /app/server.mjs
EXPOSE 1234
CMD ["node", "server.mjs"]
