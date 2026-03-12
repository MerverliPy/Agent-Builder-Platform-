FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm ci -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve","-s","build","-l","3000"]
