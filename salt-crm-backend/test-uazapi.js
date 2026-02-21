import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = process.env.UAZAPI_BASE_URL || 'https://saltdigi.uazapi.com';
const apiKey = process.env.UAZAPI_API_KEY || '4Mt9YzVvrpLwpq5cqcZvuCDH2TV27rEhFoquOLY4O2Rw1SMqz7';

async function test() {
    try {
        console.log('Testing UAZAPI with:', { baseUrl, keyLength: apiKey.length });
        const response = await axios.post(`${baseUrl}/instance/create`, {
            instanceName: 'salt_saltdemo_teste'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            }
        });
        console.log('SUCCESS:', response.data);
    } catch (error) {
        console.error('ERROR RESPONSE:', error.response?.data);
        console.error('ERROR MESSAGE:', error.message);
    }
}

test();
