#!/bin/bash

if (( $EUID != 0 )); then
    echo 'You must run this script as root.' 2>&1
    exit 1
fi

if [ -f js/main.js ] && [ -f .built ]; then
    exec node js/main.js
else
    >&2 echo 'You need to run "make" first.'
    exit 1
fi
