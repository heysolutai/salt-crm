require('dotenv').config();
const axios = require('axios');

async function testDelete() {
    const baseUrl = process.env.UAZAPI_BASE_URL;
    const apiKey = process.env.UAZAPI_API_KEY;
    const instanceName = process.argv[2] || 'salt-saltdemo-teste';

    console.log(`Testing delete for: ${instanceName}`);
    console.log(`Base URL: ${baseUrl}\n`);

    const headers = { 'admintoken': apiKey, 'apikey': apiKey };

    const endpoints = [
        { method: 'POST', url: `${baseUrl}/instance/delete` },
        { method: 'POST', url: `${baseUrl}/instance/logout` },
        { method: 'POST', url: `${baseUrl}/instance/delete/${instanceName}` },
        { method: 'POST', url: `${baseUrl}/instance/logout/${instanceName}` },
        { method: 'DELETE', url: `${baseUrl}/instance/${instanceName}` },
        { method: 'DELETE', url: `${baseUrl}/instance/delete/${instanceName}` },
    ];

    for (const ep of endpoints) {
        try {
            console.log(`${ep.method} ${ep.url}`);
            const res = await axios({ method: ep.method, url: ep.url, headers, data: { name: instanceName } });
            console.log("  => SUCCESS!", JSON.stringify(res.data).substring(0, 200));
            return;
        } catch (err) {
            console.log(`  => FAIL ${err.response?.status}: ${JSON.stringify(err.response?.data || err.message).substring(0, 150)}`);
        }
    }
    console.log('\nNenhum endpoint funcionou.');
}

testDelete();
