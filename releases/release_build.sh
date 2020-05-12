#!/bin/bash

rm -rf $1
rm -rf ./app/mewcam.app
cp -R ./mewcam-darwin-x64/mewcam.app ./app
bash ./build_dmg.sh
mkdir $1
mv mewcam.dmg $1
