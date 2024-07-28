#FROM node:21.6.2
FROM node:18


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]

EXPOSE 3000