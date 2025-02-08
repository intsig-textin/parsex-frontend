# Install dependencies only when needed
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json .npmrc yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build

# Production image, copy all the files and run nginx
FROM nginx:stable-alpine 

COPY ./nginx/nginx.conf /etc/nginx/
COPY ./nginx/default.conf /etc/nginx/conf.d/

COPY --from=builder /app/dist /var/www/html/

COPY set.env.sh ./

RUN chmod +x ./set.env.sh

EXPOSE 80

CMD ./set.env.sh && nginx -g "daemon off;"

