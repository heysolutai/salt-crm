import axios from 'axios';

async function run() {
    try {
        const login = await axios.post('http://localhost:3000/api/v1/auth/login', {
            email: 'eryk@saltdigi.com.br',
            password: 'admin123'
        });
        const token = login.data.data.token;

        console.log('Login successful. Fetching conversations...');

        const res = await axios.get('http://localhost:3000/api/v1/conversations', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(JSON.stringify(res.data, null, 2));
    } catch (e: any) {
        console.error('Error:', e.response?.data || e.message);
    }
}

run();
