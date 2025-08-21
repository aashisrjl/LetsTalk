FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the rest of the app (frontend)
COPY . .

# Ensure Vite uses polling inside Docker for HMR reliability
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 8080

CMD ["npm","run","dev"]