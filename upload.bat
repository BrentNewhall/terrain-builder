@echo off

REM CALL aws s3 cp index.html s3://terrain-builder/
REM CALL aws s3 cp style.css s3://terrain-builder/

scp -i "C:\Users\Brent Newhall\Documents\certs\brent-amazon.pem" index.html ec2-user@geekarchaeology.com:/var/www/html/terrain-builder/
scp -i "C:\Users\Brent Newhall\Documents\certs\brent-amazon.pem" main.js ec2-user@geekarchaeology.com:/var/www/html/terrain-builder/
scp -i "C:\Users\Brent Newhall\Documents\certs\brent-amazon.pem" style.css ec2-user@geekarchaeology.com:/var/www/html/terrain-builder/