import axios from 'axios';

const baseUrl = 'https://saltdigi.uazapi.com';
const apiKey = '4Mt9YzVvrpLwpq5cqcZvuCDH2TV27rEhFoquOLY4O2Rw1SMqz7';

async function run() {
    const instanceName = `test-qr-${Date.now()}`;
    const initRes = await axios.post(`${baseUrl}/instance/init`, { "name": instanceName }, {
        headers: { 'Content-Type': 'application/json', 'admintoken': apiKey }
    });
    const token = initRes.data.token;
    console.log('Token:', token);

    const endpoints = [
        `/instance/qr?name=${instanceName}`,
        `/instance/qr?token=${token}`,
        `/instance/qr/${instanceName}`,
        `/instance/connect/${instanceName}`,
        `/instance/connect/${token}`,
        `/instance/${instanceName}/qr`,
        `/instance/${instanceName}/qrcode`
    ];

    for (const ep of endpoints) {
        console.log(`\nTesting: ${ep}`);
        try {
            const res = await axios.get(`${baseUrl}${ep}`, {
                headers: { 'token': token, 'admintoken': apiKey }
            });
            console.log('SUCCESS:', Object.keys(res.data));
            if (res.data.qrcode || res.data.base64) {
                console.log('FOUND QRCODE', String(res.data.qrcode || res.data.base64).substring(0, 30));
            }
        } catch (e) {
            console.log('ERR:', e.response?.status);
        }
    }
}
run();
