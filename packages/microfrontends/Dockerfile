FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy shared-ui package which is a dependency
COPY packages/shared-ui/ ./packages/shared-ui/
COPY packages/microfrontends/ ./packages/microfrontends/

# Install dependencies and build shared-ui then microfrontends
RUN npm install
RUN npm run build --workspace=@dynamic-form/shared-ui
RUN npm run build --workspace=microfrontends

# Nginx Image
FROM nginx:alpine

COPY --from=builder /app/packages/microfrontends/dist /usr/share/nginx/html
COPY packages/microfrontends/entrypoint.sh /entrypoint.sh

# Provide a specific NGINX config with CORS headers for microfrontends
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        add_header Access-Control-Allow-Origin *; \
        add_header Access-Control-Allow-Methods "GET, OPTIONS"; \
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept"; \
    } \
}' > /etc/nginx/conf.d/default.conf

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
