#!/bin/sh

npm pack
npm install jsonresume-theme-el-santo-0.0.0.tgz
resume export index.html --theme el-santo