#!/bin/sh

echo "Cleaning workspace..."
rm -fR dist
rm -fR docs
rm -fR node_modules

echo "Installing modules..."
npm install
npm i -g @vercel/ncc

echo "Building..."
ncc build index.js -m

echo "Cleaning build files..."
cp dist/index.js main.js
rm -fR dist

echo "Done."