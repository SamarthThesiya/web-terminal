# Use Node LTS Alpine image
FROM node:lts-alpine3.19

## Set the working directory
#WORKDIR /app
#
## Copy the package.json and package-lock.json
#COPY package*.json /app
#
## Install dependencies
#

# Copy the application code
COPY . /app

WORKDIR /app

RUN npm install

# Expose the port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
