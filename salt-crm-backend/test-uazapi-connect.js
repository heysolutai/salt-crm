import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = 'https://saltdigi.uazapi.com';
const apiKey = '4Mt9YzVvrpLwpq5cqcZvuCDH2TV27rEhFoquOLY4O2Rw1SMqz7';

async function run() {
    try {
        const initRes = await axios.post(`${baseUrl}/instance/init`, {
            "name": `test-qrcode-${Date.now()}`
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'admintoken': apiKey
            }
        });

        const token = initRes.data.token;
        console.log('INIT Token:', token);

        const endpoints = [
            `/instance/connect?token=${token}`,
            `/instance/connect/${token}`,
            `/instance/qr`,
            `/instance/connect` // as GET with token header
        ];

        for (const ep of endpoints) {
            console.log(`\nTesting: ${ep}`);
            try {
                const res = await axios.get(`${baseUrl}${ep}`, {
                    headers: { 'token': token }
                });
                console.log('SUCCESS:', Object.keys(res.data));
            } catch (e) {
                console.log('ERR:', e.response?.status, e.response?.data);
            }
        }

    } catch (error) {
        console.error('ERROR:', error.message);
    }
}

run();
