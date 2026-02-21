import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com';
const apiKey = process.env.UAZAPI_API_KEY || '';

async function test() {
    let instanceId = '';
    let instanceToken = '';

    // 1. Create Instance
    try {
        console.log('\n--- 1. Creating Instance ---');
        const response = await axios.post(`${baseUrl}/instance/create`, {
            instanceName: `test_${Date.now()}`
        }, {
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            }
        });
        console.log('CREATE SUCCESS:', JSON.stringify(response.data, null, 2));

        // Extract token and instance name from response based on Evolution API format
        instanceId = response.data.instance?.instanceName || response.data.instanceName || response.data.name;
        instanceToken = response.data.hash?.apikey || response.data.hash || response.data.qrcode?.token || '';

        console.log('\nExtracted -> Instance:', instanceId, '| Token:', instanceToken);
    } catch (error) {
        console.error('CREATE ERROR:', error.response?.data || error.message);
        return;
    }

    // 2. Connect Instance (Get QR)
    if (instanceId) {
        try {
            console.log('\n--- 2. Connecting Instance ---');
            const response = await axios.get(`${baseUrl}/instance/connect/${instanceId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey // or Bearer token
                }
            });
            console.log('CONNECT SUCCESS:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
        } catch (error) {
            console.error('CONNECT ERROR:', error.response?.data || error.message);
        }
    }
}

test();
