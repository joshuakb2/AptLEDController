# AptLEDController
Software to facilitate controlling LED lights in my apartment.

## Info about this repo

There are 3 root branches: master, server, and raspberryPi.
  - The server branch only contains the folder `server` and its contents. **All changes to these files need to be made in the server branch or one of its subordinate branches.**
  - The raspberryPi branch only contains the folder `raspberryPi` and its contents. **All changes to these files need to be made in the raspberryPi branch or one of its subordinate branches.**
  - The master branch is the result of merges from both the server and raspberryPi branches, plus some additional stuff like this readme.

## IFTTT

If This Then That is an online service that allows anyone to assign actions to certain triggers from their various services. Google Assistant is one of the services that has provided IFTTT triggers, so I'm using IFTTT.com to create custom voice commands for changing the LEDs. Here is how it is currently set up:

  - Trigger
    - Google Assistant
    - "Say a phrase with a text ingredient"
    - If you say "Make the <living room|kitchen> $" (where $ is the variable text)
  - Action
    - Web hook
    - URL: http://jbserver.no-ip.org:15837/livingRoom
    - Method: POST
    - Content type: application/json
    - Body: {"makeIt":"$","token":"<insert the token I've created for your account here>"} (where $ is the variable text)
