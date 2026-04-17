FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json nx.json ./
COPY apps/microfrontends/mfe-list/package.json ./apps/microfrontends/mfe-list/
COPY libs/ ./libs/
RUN npm ci
COPY apps/microfrontends/mfe-list/ ./apps/microfrontends/mfe-list/
RUN npx nx build mfe-list

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/apps/microfrontends/mfe-list/dist /usr/share/nginx/html
EXPOSE 80
CMD ["npx", "serve", "-s", "/usr/share/nginx/html", "-l", "80"]
