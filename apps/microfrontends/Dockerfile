FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npx nx build microfrontends

FROM nginx:alpine
COPY --from=builder /app/apps/microfrontends/dist /usr/share/nginx/html
COPY apps/microfrontends/entrypoint.sh /entrypoint.sh
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
