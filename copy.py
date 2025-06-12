import os

os.system("quasar build")
os.system("scp -r dist/spa/* kurtn3x@193.218.118.220:/var/www/kurtn3x.xyz/www/.")
