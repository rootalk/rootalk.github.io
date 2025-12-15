#!/bin/sh
# npm install
# git clone https://github.com/GallenHu/hexo-theme-light.git themes/light --depth=1
git clone https://github.com/GallenHu/hexo-theme-minos.git themes/minos
cp themes/minos/_config.example.yml themes/minos/_config.yml
node init_script.js

if [ -d public ]; then
  rm -rf public
fi

npm run build
