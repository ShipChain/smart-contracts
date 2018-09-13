FROM node:alpine

RUN apk add --no-cache \
    libc6-compat \
    su-exec

RUN npm install -g truffle

COPY compose/truffle/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /srv/truffle

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

