import axios from 'axios';
const baseUrl = 'https://saltdigi.uazapi.com';
const apiKey = '4Mt9YzVvrpLwpq5cqcZvuCDH2TV27rEhFoquOLY4O2Rw1SMqz7';

async function run() {
    const initRes = await axios.post(`${baseUrl}/instance/init`, { "name": `test-qr-${Date.now()}` }, {
        headers: { 'Content-Type': 'application/json', 'admintoken': apiKey }
    });
    const token = initRes.data.token;
    console.log('Token:', token);

    // wait 2 seconds for QR generation
    await new Promise(r => setTimeout(r, 2000));

    try {
        const res = await axios.get(`${baseUrl}/instance/status`, { headers: { 'token': token } });
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) { console.log(e.message); }
}
run();
