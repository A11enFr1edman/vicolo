/*
 * Vicolo
 * Applications Parameters
 *
 */

module.exports = {

    // DATABASE
    basic_db: 'vicolo',
    mongodb_ip: '127.0.0.1', // the mongodb host
    mongodb_port: 27017, // the mongodb port

    // Cookies and session
    cookie_secret: '0acbd5c92bd99ba02bad5bab985a26c5',

    client_host: '127.0.0.1', // the client host
    client_port: '8000', // the client port

    // Comment this options if you want http connection
    /*https_options: { //HTTPS Options
        private_key: __dirname + '/certs/privatekey.pem', // the HTTPS private key
        certificate: __dirname + '/certs/certificate.pem', // the HTTPS certificate
    },
*/

    // The port where dns listen
    dns_port: 53,

    // DNS record mapping
    record_mapping: {
	1: 'A',
	15: 'MX',
	16: 'TXT'
    },

    // Rest error messages
    messages: {
	empty: 'The field is empty',
        wrong: 'Wrong type', 
	appError: 'Application error',
	editUser: 'User edit error',
	notFound: 'Not found',
        done: 'Done',
        fail: 'Failed',
        notAllowed: 'Type not allowed',
        notAuthorized: 'Not Authorized'
    }
};
