#!/bin/bash

if (( $EUID == 0 )); then
    exec python py/main.py
else
    echo 'You must run this script as root!'
    exit 1
fi
