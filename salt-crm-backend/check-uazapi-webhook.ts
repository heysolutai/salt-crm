import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseUrl = 'https://saltdigi.uazapi.com';
const apiKey = '4Mt9YzVvrpLwpq5cqcZvuCDH2TV27rEhFoquOLY4O2Rw1SMqz7'; // Get from previous files

async function checkInstances() {
    try {
        console.log('Fetching instances to check webhook configuration...');
        const res = await axios.get(`${baseUrl}/instance/fetchInstances`, {
            headers: { 'admintoken': apiKey }
        });

        console.log(`Found ${res.data.length} instances.`);

        for (const instance of res.data) {
            console.log(`\nInstance: ${instance.instance.instanceName}`);

            // Try to get webhook info for this instance using the instance token
            try {
                // We need to fetch settings or webhook info. Let's try to get settings if possible
                const settingsRes = await axios.get(`${baseUrl}/settings/find/${instance.instance.instanceName}`, {
                    headers: { 'admintoken': apiKey }
                });
                console.log('Settings:', JSON.stringify(settingsRes.data, null, 2));
            } catch (e: any) {
                console.log('Could not fetch settings for this instance:', e.response?.status, e.response?.data);
            }
        }

    } catch (error: any) {
        console.error('ERROR:', error.response?.data || error.message);
    }
}

checkInstances();
