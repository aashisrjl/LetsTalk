FROM node:18

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend code
COPY . .

# Improve file watching reliability in Docker for nodemon
ENV CHOKIDAR_USEPOLLING=true

# Expose port
EXPOSE 3000

# Run server
CMD ["npm", "start"]
