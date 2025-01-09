#!/bin/bash

lang=$1

if [ -z $lang ]; then
    echo "Usage: $0 <language>"
    exit 1
fi

pnpm build --filter @
pnpm build

cd packages/core
pnpm gen download
pnpm gen generate $lang && pnpm gen translate $lang
# pnpm gen translate $lang