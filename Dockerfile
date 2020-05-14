# The first instruction is what image we want to base our container on
# We Use an official Node version 10 image as a parent image
FROM node:8.10

# Create an environment variable for MongoDB URI
#ENV MONGODB_URI='mongodb://172.28.0.2:27017/research'

# Set working directory for the project to /usr/src/app
# NOTE: all the directives that follow in the Dockerfile will be executed
# in working directory.
WORKDIR /usr/src/app

# Copy the contents of the project folder into the working directory of
# docker image
COPY . /usr/src/app/

# Install any needed packages specified in package.json
RUN npm install

EXPOSE 5000

# Wait 5 seconds for the MongoDB connection
CMD echo "Warming up" && sleep 5 && npm start