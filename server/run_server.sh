#!/bin/sh

if [ -f js/main.js ] && [ -f .built ]; then
    exec node js/main.js
else
    >&2 echo 'You need to run "make" first.'
    exit 1
fi
