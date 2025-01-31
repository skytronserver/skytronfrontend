# Stage 1: Build
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy the build files to the Nginx HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration file
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose the port Nginx listens on
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
