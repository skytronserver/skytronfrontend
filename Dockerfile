# Stage 1: Build
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy the build files to the Nginx HTML directory
COPY --from=build /app/build /usr/share/nginx/html

<<<<<<< Updated upstream
# Copy the custom Nginx configuration file
COPY default.conf /etc/nginx/conf.d/default.conf
=======
# Copy the Nginx config as a template
COPY default.conf /etc/nginx/conf.d/default.template

>>>>>>> Stashed changes

# Expose the port Nginx listens on
EXPOSE 80

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
