#!/bin/sh

cd js
if [ -f main.js ]; then
    exec node main.js
else
    >&2 echo 'You need to run "make" first.'
    exit 1
fi
