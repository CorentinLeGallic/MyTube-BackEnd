# DEV MODE

# Use Node.js v20
FROM node:20-alpine AS dev

WORKDIR /app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the project dependencies in the container
RUN npm install

# Copy the rest of the files in the container as the node user
COPY --chown=node:node . .

EXPOSE 8000

# Set the PORT environment variable to 8000
ENV PORT=8000

# Run the app in dev mode
CMD ["npm", "run", "start:dev"]