import os
os.system("npm run build")
os.system("scp -r dist/* root@vps2305095.fastwebserver.de:/var/www/kurtn3x.xyz/test2/.")