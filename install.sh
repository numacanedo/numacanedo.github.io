#!/bin/sh

echo "Installing modules..."
npm install
node node_modules/puppeteer/install.js

echo "Done."
