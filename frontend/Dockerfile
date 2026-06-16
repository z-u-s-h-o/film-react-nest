FROM node:20-alpine AS builder


WORKDIR /app


COPY package.json ./
COPY package-lock.json* ./

RUN npm install
RUN npm install typescript --save-dev

COPY . .

ARG VITE_API_URL="http://localhost:3000/api/afisha"
ARG VITE_CDN_URL="http://localhost:3000/content/afisha"


RUN VITE_API_URL=${VITE_API_URL} VITE_CDN_URL=${VITE_CDN_URL} npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
