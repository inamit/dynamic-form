FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json nx.json ./
COPY apps/microfrontends/mfe-form/package.json ./apps/microfrontends/mfe-form/
COPY libs/ ./libs/
RUN npm ci
COPY apps/microfrontends/mfe-form/ ./apps/microfrontends/mfe-form/
RUN npx nx build mfe-form

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/apps/microfrontends/mfe-form/dist /usr/share/nginx/html
EXPOSE 80
CMD ["npx", "serve", "-s", "/usr/share/nginx/html", "-l", "80"]
