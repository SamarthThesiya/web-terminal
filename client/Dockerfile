# Use Node LTS Alpine image
FROM node:lts-alpine3.19

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Expose the port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
