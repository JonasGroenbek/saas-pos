FROM node:16.14.0

WORKDIR /backend

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

CMD ["node", "dist/main"]
