@echo off

CALL aws s3 cp index.html s3://terrain-builder/
CALL aws s3 cp style.css s3://terrain-builder/
