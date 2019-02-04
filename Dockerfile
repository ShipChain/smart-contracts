FROM node:alpine

RUN apk add --no-cache \
    libc6-compat \
    su-exec \
    # git, python, make, g++ are for installing/building several npm modules
    git \
    python \
    make \
    g++ \
    # graphviz, font-bitstream-type1 for building dependency graphs
    graphviz \
    font-bitstream-type1

RUN npm install -g truffle@5.0.3

COPY compose/truffle/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /srv/truffle

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

