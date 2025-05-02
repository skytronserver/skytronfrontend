FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies 
RUN npm ci && \
    npm cache clean --force

# Copy application
COPY . .


# Build the application (if needed)
# RUN npm run build

EXPOSE 3000


CMD ["npm", "start"] 