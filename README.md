VICOLO
================================================
DNS Server on MongoDB with rest api and more.     
Based on: https://github.com/tjfontaine/node-dns      
*IMP*: Project under development, help and discussion on features are welcome.     
*IMP*: Default dns port is 53 and you must run the application as root.     
Test with dig: dig @127.0.0.1 www.google.com

Record information
----------------------
`{domain: '', value: [{name: '', address: '', ttl: ''}], type: ''}`    
in value for mx need priority and exchanges, in txt data etc

Curl request example
---------------------
Login: `curl -d "email=...&password=..." http://localhost:8000/login -c cookie.txt`    
Make request using cookie: `curl http://localhost:8000/ -b cookie.txt -c cookie.txt`    
Create a new record using cookie: `curl -d "domain=...&type=...&name=...&address=...&ttl=..." http://localhost:8000/dns/record/new -b cookie.txt -c cookie.txt`
Create an user: `curl -d "email=...&password=...&name=..." http://localhost:8000/user/create`
(There are /user/view and /user/edit too)

User Role
---------------------
The default user role for restricted route are: 0 (admin), 1 (user)     
You can define your own roles.

-------------------------------------------------------
LICENSE (The MIT License)

Copyright (c) 2013 Andrea Di Mario

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
