import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = 'https://saltdigi.uazapi.com';
const apiKey = '4Mt9YzVvrpLwpq5cqcZvuCDH2TV27rEhFoquOLY4O2Rw1SMqz7'; // the user's specific key that worked for him earlier or we'll text with the exact one from curl if different

async function run() {
    try {
        console.log(`\n--- Testing UAZAPI create instance ---`);
        const response = await axios.post(`${baseUrl}/instance/init`, {
            "name": "minha-instancia-backend-test",
            "systemName": "apilocal",
            "adminField01": "custom-metadata-1",
            "adminField02": "custom-metadata-2",
            "fingerprintProfile": "chrome",
            "browser": "chrome"
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'admintoken': apiKey
            }
        });
        console.log('SUCCESS:', JSON.stringify(response.data, null, 2).substring(0, 500));
    } catch (error) {
        console.error('ERROR (status):', error.response?.status);
        console.error('ERROR (data):', JSON.stringify(error.response?.data, null, 2));
    }
}

run();
