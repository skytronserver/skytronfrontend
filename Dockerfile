# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine

# Set working directory in Nginx container
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy build output from builder stage
COPY --from=builder /app/build .

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (we will map this to 5003 outside)
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
