# Use the official Node.js image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the application source code
COPY . .

# Expose the port that the app runs on
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
