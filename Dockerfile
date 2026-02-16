# DEV MODE

# Use Node.js v20
FROM node:20-alpine AS dev

WORKDIR /app

# Copy the package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the prisma directory and generate the Prisma DB
COPY prisma ./prisma
RUN npx prisma generate

# Copy the entrypoint.sh script and make it executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
RUN chown node:node /app/entrypoint.sh

# Copy the rest of the files in the container as the node user
COPY --chown=node:node . .

EXPOSE 8000

# Set the PORT environment variable to 8000
ENV PORT=8000

# Set the entrypoint.sh script as the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Run the app in dev mode
CMD ["npm", "run", "start:dev"]