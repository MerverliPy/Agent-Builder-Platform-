FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
# Install the 'serve' static server globally. Use 'npm install -g' (not 'npm ci -g').
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve","-s","build","-l","3000"]
