#!/bin/bash
if [ ! -d "$1" ]; then
  echo "Directory $1 doesn't exists"
  exit
fi
function="shopDemo_$1"
cd $1
zip -r function.zip .
aws lambda update-function-code --function-name $function --zip-file fileb://function.zip
rm function.zip
