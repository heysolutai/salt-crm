import axios from 'axios';
const baseUrl = 'https://saltdigi.uazapi.com';
const apiKey = '4Mt9YzVvrpLwpq5cqcZvuCDH2TV27rEhFoquOLY4O2Rw1SMqz7';

async function run() {
    const initRes = await axios.post(`${baseUrl}/instance/init`, { "name": `test-qr-post-${Date.now()}` }, {
        headers: { 'Content-Type': 'application/json', 'admintoken': apiKey }
    });
    const token = initRes.data.token;
    console.log('INIT Token:', token);

    try {
        const res = await axios.post(`${baseUrl}/instance/connect`, {}, { headers: { 'token': token } });
        console.log("SUCCESS:");
        console.log(JSON.stringify(res.data, null, 2).substring(0, 500));
    } catch (e) { console.log("ERR (Token):", e.response?.status, e.response?.data); }

    try {
        const res2 = await axios.post(`${baseUrl}/instance/connect`, { number: "" }, { headers: { 'token': token } });
        console.log("SUCCESS (number option):", res2.status);
    } catch (e) { console.log("ERR (number option):", e.response?.status); }
}
run();
