require('dotenv').config();
const axios = require('axios');

async function testDelete() {
    const baseUrl = process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com';
    const apiKey = process.env.UAZAPI_API_KEY;
    const instanceName = process.argv[2];

    if (!instanceName) {
        console.error("Please provide an instance name to delete. Example: node test-uazapi-delete.js instance_name");
        return;
    }

    console.log(`Attempting to delete instance: ${instanceName}`);
    console.log(`Base URL: ${baseUrl}`);

    const headers = {
        'apikey': apiKey,
        'admintoken': apiKey
    };

    const endpoints = [
        { method: 'DELETE', url: `${baseUrl}/instance/delete/${instanceName}` },
        { method: 'DELETE', url: `${baseUrl}/instance/logout/${instanceName}` },
        { method: 'DELETE', url: `${baseUrl}/instance/${instanceName}` },
        { method: 'POST', url: `${baseUrl}/instance/logout/${instanceName}` },
        { method: 'POST', url: `${baseUrl}/instance/delete/${instanceName}` },
    ];

    for (const ep of endpoints) {
        try {
            console.log(`\nTrying: ${ep.method} ${ep.url}`);
            const res = await axios({ method: ep.method, url: ep.url, headers });
            console.log("SUCCESS!");
            console.log(res.data);
            return;
        } catch (err) {
            console.log("FAILED:", err.response?.status, err.response?.data || err.message);
        }
    }
}

testDelete();
