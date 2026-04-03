FROM node:18-slim

WORKDIR /pokerole_dex

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "code/test.js"]