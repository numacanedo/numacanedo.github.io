#!/bin/sh

echo "Cleaning workspace..."
rm -fR dist
rm -fR docs
rm -fR node_modules

echo "Installing modules..."
npm install
node node_modules/puppeteer/install.js
npm i -g @vercel/ncc

echo "Building..."
ncc build index.js

echo "Cleaning build files..."
cp dist/index.js main.js
rm -fR dist

echo "Pushing changes..."
git add .
git commit -m 'New resume action build'
git tag -d v1
git tag -a -m 'v1' v1
git push --follow-tags

echo "Done."
