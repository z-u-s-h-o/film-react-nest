FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev 

COPY . .

ARG VITE_API_URL="/api/afisha"
ARG VITE_CDN_URL="/content/afisha"
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_CDN_URL=${VITE_CDN_URL}

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
