import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = 'https://saltdigi.uazapi.com';
const apiKey = '4Mt9YzVvrpLwpq5cqcZvuCDH2TV27rEhFoquOLY4O2Rw1SMqz7';

async function run() {
    try {
        const initRes = await axios.post(`${baseUrl}/instance/init`, {
            "name": `test-qrcode-scan-${Date.now()}`
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'admintoken': apiKey
            }
        });

        const token = initRes.data.token;
        console.log('INIT Token:', token);

        const endpointsToTest = [
            { method: 'GET', url: `/instance/qr`, headers: { 'token': token } },
            { method: 'GET', url: `/instance/qrcode`, headers: { 'token': token } },
            { method: 'GET', url: `/instance/status`, headers: { 'token': token } },
            { method: 'GET', url: `/instance/info`, headers: { 'token': token } },
            { method: 'GET', url: `/instance/connect`, headers: { 'token': token } },
            { method: 'GET', url: `/instance/qr?token=${token}`, headers: { 'admintoken': apiKey } },
            { method: 'GET', url: `/qrcode?token=${token}`, headers: {} },
            { method: 'GET', url: `/session/qr/${token}`, headers: { 'admintoken': apiKey } },
            { method: 'POST', url: `/instance/qr`, headers: { 'token': token } },
            { method: 'GET', url: `/docs`, headers: {} },
            { method: 'GET', url: `/api-docs`, headers: {} }
        ];

        for (const ep of endpointsToTest) {
            console.log(`\nTesting: ${ep.method} ${ep.url}`);
            try {
                const res = await axios({
                    method: ep.method,
                    url: `${baseUrl}${ep.url}`,
                    headers: ep.headers,
                    timeout: 5000
                });
                console.log('SUCCESS:', res.status, typeof res.data === 'string' ? res.data.substring(0, 100) : Object.keys(res.data));
            } catch (e) {
                console.log('ERR:', e.response?.status, e.response?.data);
            }
        }

    } catch (error) {
        console.error('ERROR:', error.message);
    }
}

run();
