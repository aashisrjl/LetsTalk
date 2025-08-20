FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm Install

COPY . .

EXPOSE 8080

CMD ["npm","run","dev"]