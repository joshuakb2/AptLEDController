#!/bin/sh

echo 'Generating a random hexadecimal string token. This will take a while....'
echo

exec hexdump -n 16 -e '4/4 "%08X" 1 "\n"' /dev/random
