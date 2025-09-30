# Stage 1: Build the Angular application
FROM node:16-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN npm run build --prod

# Verify the build output
RUN ls -la /usr/src/app/dist/transaction-mfe

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the built application from the previous stage
COPY --from=build /usr/src/app/dist/transaction-mfe /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 4201
EXPOSE 4201

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]