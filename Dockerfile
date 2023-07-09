# FROM ghcr.io/puppeteer/puppeteer
FROM node:18

RUN apt-get update \
 && apt-get install -y chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends

USER node

WORKDIR /merlin

COPY --chown=node package.json .
COPY --chown=node yarn.lock .

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

# Install dependencies
RUN yarn install

# Copy source code
COPY --chown=node . .

# Build the app
RUN yarn build

# Expose port 3000
EXPOSE 8080

# Run the app
CMD ["yarn", "start"]
