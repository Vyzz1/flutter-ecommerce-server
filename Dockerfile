FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

RUN npm install typescript --save-dev

COPY . .

RUN npx tsc

# Copy templates sau khi tsc, vì tsc không chuyển file .handlebars
RUN mkdir -p dist/templates
COPY templates dist/templates

EXPOSE 8080

CMD ["node", "dist/server.js"]
