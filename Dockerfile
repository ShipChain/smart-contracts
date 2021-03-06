FROM ethereum/solc:0.5.12 as solc

FROM node:10.15.0-alpine

COPY --from=solc /usr/bin/solc /usr/bin/

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

COPY compose/truffle/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /srv/truffle

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

