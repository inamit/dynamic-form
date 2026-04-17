FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json nx.json ./
COPY apps/management-client/package.json ./apps/management-client/
COPY libs/ ./libs/
RUN npm ci
COPY apps/management-client/ ./apps/management-client/
RUN npx nx build management-client

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/apps/management-client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["npx", "serve", "-s", "/usr/share/nginx/html", "-l", "80"]
