FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npx nx build example-app-angular

FROM nginx:alpine
COPY --from=builder /app/apps/examples/example-app-angular/dist/example-app-angular/browser /usr/share/nginx/html
COPY apps/examples/example-app-angular/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN mkdir -p /usr/share/nginx/html/assets
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
