const soap = require('soap');

const url = 'http://localhost:8002/bank?wsdl';

console.log('Connecting to SOAP service...');

soap.createClient(url, (err, client) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log('Connected to SOAP service');

    // SOAP Headers
    const securityHeader = {
        Security: {
            APIKey: 'BANK-API-KEY-12345'
        }
    };

    const transactionHeader = {
        Transaction: {
            TransactionID: 'TXN-' + Date.now(),
            Channel: 'SOAP-API'
        }
    };

    // Test 1: Check Balance với Security Header
    console.log('\n1. Testing checkBalance with Security Header');
    
    client.addSoapHeader(securityHeader);
    
    client.checkBalance({ accountNumber: '1234567890' }, (err, result) => {
        if (err) {
            console.error('Error:', err.message);
        } else {
            console.log('Balance Result:', result);
        }
        
        // Test 2: Transfer Funds với Multiple Headers
        console.log('\n2. Testing transferFunds with Multiple Headers');
        
        client.addSoapHeader(securityHeader);
        client.addSoapHeader(transactionHeader);
        
        client.transferFunds({
            fromAccount: '1234567890',
            toAccount: '0987654321', 
            amount: 1000000
        }, (err, result) => {
            if (err) {
                console.error('Error:', err.message);
            } else {
                console.log('Transfer Result:', result);
            }
            
            console.log('\nSOAP Demo Completed');
        });
    });
});