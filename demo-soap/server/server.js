const soap = require('soap');
const express = require('express');
const http = require('http');

const app = express();

// Database mock
const accounts = [
    { accountNumber: '1234567890', owner: 'Nguyen Van A', balance: 5000000, currency: 'VND' },
    { accountNumber: '0987654321', owner: 'Tran Thi B', balance: 3000000, currency: 'VND' }
];

// Xử lý SOAP Headers
function handleHeaders(headers) {
    console.log('SOAP Headers:', headers);
    
    if (headers && headers.Security) {
        const apiKey = headers.Security.APIKey;
        if (apiKey !== 'BANK-API-KEY-12345') {
            throw new Error('Invalid API Key');
        }
    } else {
        throw new Error('Security header required');
    }
    
    if (headers && headers.Transaction) {
        return headers.Transaction.TransactionID;
    }
    return null;
}

// SOAP Service
const bankService = {
    BankService: {
        BankPort: {
            checkBalance: function(args, callback, headers) {
                console.log('SOAP Request: checkBalance');
                
                try {
                    handleHeaders(headers);
                    
                    const account = accounts.find(acc => acc.accountNumber === args.accountNumber);
                    if (!account) {
                        throw new Error('Account not found');
                    }

                    const response = {
                        accountNumber: account.accountNumber,
                        balance: account.balance,
                        currency: account.currency
                    };

                    callback(null, response);

                } catch (error) {
                    callback(error);
                }
            },

            transferFunds: function(args, callback, headers) {
                console.log('SOAP Request: transferFunds');
                
                try {
                    const transactionId = handleHeaders(headers);
                    
                    if (!transactionId) {
                        throw new Error('Transaction header required');
                    }

                    const fromAccount = accounts.find(acc => acc.accountNumber === args.fromAccount);
                    const toAccount = accounts.find(acc => acc.accountNumber === args.toAccount);

                    if (!fromAccount || !toAccount) {
                        throw new Error('Account not found');
                    }

                    if (fromAccount.balance < args.amount) {
                        throw new Error('Insufficient funds');
                    }

                    fromAccount.balance -= args.amount;
                    toAccount.balance += args.amount;

                    const response = {
                        transactionId: transactionId,
                        fromAccount: fromAccount.accountNumber,
                        toAccount: toAccount.accountNumber,
                        amount: args.amount,
                        newBalance: fromAccount.balance,
                        status: 'completed'
                    };

                    callback(null, response);

                } catch (error) {
                    callback(error);
                }
            }
        }
    }
};

// WSDL
const wsdl = `<?xml version="1.0"?>
<definitions name="BankService"
    targetNamespace="http://localhost:8002/bank"
    xmlns="http://schemas.xmlsoap.org/wsdl/"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:tns="http://localhost:8002/bank"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema">

    <types>
        <xsd:schema targetNamespace="http://localhost:8002/bank">
            <xsd:element name="SecurityHeader">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="APIKey" type="xsd:string"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>

            <xsd:element name="TransactionHeader">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="TransactionID" type="xsd:string"/>
                    <xsd:element name="Channel" type="xsd:string"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>

            <xsd:element name="checkBalanceRequest">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="accountNumber" type="xsd:string"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
            
            <xsd:element name="checkBalanceResponse">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="accountNumber" type="xsd:string"/>
                        <xsd:element name="balance" type="xsd:double"/>
                        <xsd:element name="currency" type="xsd:string"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>

            <xsd:element name="transferRequest">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="fromAccount" type="xsd:string"/>
                        <xsd:element name="toAccount" type="xsd:string"/>
                        <xsd:element name="amount" type="xsd:double"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>

            <xsd:element name="transferResponse">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="transactionId" type="xsd:string"/>
                        <xsd:element name="fromAccount" type="xsd:string"/>
                        <xsd:element name="toAccount" type="xsd:string"/>
                        <xsd:element name="amount" type="xsd:double"/>
                        <xsd:element name="newBalance" type="xsd:double"/>
                        <xsd:element name="status" type="xsd:string"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
        </xsd:schema>
    </types>

    <message name="checkBalanceInput">
        <part name="headers" element="tns:SecurityHeader"/>
        <part name="parameters" element="tns:checkBalanceRequest"/>
    </message>
    
    <message name="checkBalanceOutput">
        <part name="parameters" element="tns:checkBalanceResponse"/>
    </message>

    <message name="transferInput">
        <part name="headers" element="tns:SecurityHeader"/>
        <part name="transactionHeader" element="tns:TransactionHeader"/>
        <part name="parameters" element="tns:transferRequest"/>
    </message>
    
    <message name="transferOutput">
        <part name="parameters" element="tns:transferResponse"/>
    </message>

    <portType name="BankPortType">
        <operation name="checkBalance">
            <input message="tns:checkBalanceInput"/>
            <output message="tns:checkBalanceOutput"/>
        </operation>
        <operation name="transferFunds">
            <input message="tns:transferInput"/>
            <output message="tns:transferOutput"/>
        </operation>
    </portType>

    <binding name="BankBinding" type="tns:BankPortType">
        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
        
        <operation name="checkBalance">
            <soap:operation soapAction="http://localhost:8002/bank/checkBalance"/>
            <input>
                <soap:header message="tns:checkBalanceInput" part="headers" use="literal"/>
                <soap:body use="literal"/>
            </input>
            <output>
                <soap:body use="literal"/>
            </output>
        </operation>
        
        <operation name="transferFunds">
            <soap:operation soapAction="http://localhost:8002/bank/transferFunds"/>
            <input>
                <soap:header message="tns:transferInput" part="headers" use="literal"/>
                <soap:header message="tns:transferInput" part="transactionHeader" use="literal"/>
                <soap:body use="literal"/>
            </input>
            <output>
                <soap:body use="literal"/>
            </output>
        </operation>
    </binding>

    <service name="BankService">
        <port name="BankPort" binding="tns:BankBinding">
            <soap:address location="http://localhost:8002/bank"/>
        </port>
    </service>
</definitions>`;

// Server setup
const server = http.createServer(app);
soap.listen(server, '/bank', bankService, wsdl);

app.get('/', (req, res) => {
    res.send(`
        <h1>SOAP Service with Headers</h1>
        <p>WSDL: <a href="/bank?wsdl">/bank?wsdl</a></p>
    `);
});

const PORT = 8002;
server.listen(PORT, () => {
    console.log('SOAP Server running at http://localhost:' + PORT);
});