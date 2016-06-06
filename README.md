# Readme
This is the back-end of MeetAbroad.

## npm
You need to run 'npm install'.

## bower
For client-side javascript libraries, you need to run: 'bower install' from the 'public' directory.

## configure application
Open fb.js and gg.js and configure the API details.
Open js/controllers/profile.js and find 'http://147.83.7.163:3000' and replace by your domain and port (if any)

## changing the port
If you want to use on a production environment, you should consider changing the listening port to 80 rather than 3000.

## MongoDB
MongoDB is required! It must be running.