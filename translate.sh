#!/bin/bash

lang=$1

if [ -z $lang ]; then
    echo "Usage: $0 <language>"
    exit 1
fi

pnpm install --frozen-lockfile
pnpm build

cd packages/core
pnpm mitre-ttp-gen download
pnpm mitre-ttp-gen generate $lang && pnpm mitre-ttp-gen translate $lang
# pnpm gen translate $lang