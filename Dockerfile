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

# Install envsubst utility
RUN apk add --no-cache bash gettext

# Copy the build files to the Nginx HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy the Nginx config as a template
COPY default.conf /etc/nginx/conf.d/default.template

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose the port Nginx listens on
EXPOSE 80

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]