VICOLO
================================================
DNS Server on MongoDB with rest api and more.     
Based on: https://github.com/tjfontaine/node-dns (DNS Server part)     
*IMP*: Project under development, help and discussion on features are welcome.    

Record information
----------------------
`{domain: '', value: [{name: '', address: '', ttl: ''}], type: ''}`    
in value for mx need priority and exchanges, in txt data etc

Curl request example
---------------------
Login: `curl -d "email=...&password=..." http://localhost:8000/login -c cookie.txt`    
Make request using cookie: `curl http://localhost:8000/ -b cookie.txt -c cookie.txt`    
Create a new record using cookie: `curl -d "domain=...&type=...&name=...&address=...&ttl=..." http://localhost:8000/ -b cookie.txt -c cookie.txt`
