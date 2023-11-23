FROM node:lts-bullseye-slim@sha256:d93fb5c25db163dc795d40eabf66251a2daf6a2c6a2d21cc29930e754aef4c2c AS base

RUN npm config set unsafe-perm true && npm install -g pnpm

ENV PNPM_FLAGS=--shamefully-hoist

WORKDIR /usr/app

## DEPENDENCIES
FROM base AS dependencies

ENV NODE_ENV=production

COPY pnpm-lock.yaml ./

RUN pnpm fetch --prod

COPY package.json ./

RUN pnpm install -r --offline --prod


## BUILD
FROM base AS builder

COPY pnpm-lock.yaml ./

RUN pnpm fetch

COPY package.json tsconfig.json ./

RUN pnpm install -r --offline

COPY ./ ./

RUN pnpm db:generate && pnpm build

# Production image
FROM node:lts-alpine3.18@sha256:c8245ebe9d86862ab40bbaee04f69f9787c57b83beb6e9a174e8afc154989e1f AS final

RUN apk update && \
  apk add --no-cache ca-certificates openssl dumb-init && \
  rm -rf /var/cache/apk/*

ENV NODE_ENV=production
ENV PNPM_FLAGS=--shamefully-hoist

WORKDIR /usr/app

COPY --chown=node:node package.json ./
COPY --chown=node:node ./scripts/start.sh ./
COPY --from=dependencies --chown=node:node /usr/app/node_modules ./node_modules
COPY --from=builder /usr/app/dist ./dist

RUN chmod +x ./start.sh && chown node:node /app

EXPOSE ${PORt}

USER node

####### TARGETS

FROM final AS production

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["/bin/bash", "-c", "./start.sh"]

FROM final AS development

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["/bin/bash", "-c", "./start_dev.sh"]
