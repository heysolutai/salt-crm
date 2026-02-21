import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com';
const apiKey = process.env.UAZAPI_API_KEY || '';

async function testWithHeaders(headers, name) {
    try {
        console.log(`\n--- Testing format ${name} ---`);
        const response = await axios.post(`${baseUrl}/instance/create`, {
            instanceName: `test_${Date.now()}`
        }, { headers });
        console.log('SUCCESS:', JSON.stringify(response.data, null, 2).substring(0, 200));
        return true;
    } catch (error) {
        console.error('ERROR:', error.response?.status, error.response?.data?.error || error.response?.data?.message || error.message);
        return false;
    }
}

async function run() {
    console.log('Using Key:', apiKey.substring(0, 10) + '...');

    // Format 1: Evolution API standard Global API Key
    await testWithHeaders({
        'Content-Type': 'application/json',
        'apikey': apiKey
    }, 'apikey');

    // Format 2: Bearer Token
    await testWithHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    }, 'Authorization: Bearer');

    // Format 3: globalapikey (older Chatwoot / Evolution versions)
    await testWithHeaders({
        'Content-Type': 'application/json',
        'globalapikey': apiKey
    }, 'globalapikey');

    // Format 4: token
    await testWithHeaders({
        'Content-Type': 'application/json',
        'token': apiKey
    }, 'token');
}

run();
