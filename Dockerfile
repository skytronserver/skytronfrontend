FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean cache
RUN npm ci && \
    npm cache clean --force

# Copy the rest of the application
COPY . .

# Build the application (if needed)
# RUN npm run build

EXPOSE 3000

# Use a non-root user for better security
USER node

CMD ["npm", "start"] 