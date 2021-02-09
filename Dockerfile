# Build server
FROM node:12.20

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --silent

COPY . .

EXPOSE 4000

CMD ["npm","start"]