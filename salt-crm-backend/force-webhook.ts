import axios from 'axios';

const baseUrl = 'https://saltdigi.uazapi.com';
const apiKey = '4Mt9YzVvrpLwpq5cqcZvuCDH2TV27rEhFoquOLY4O2Rw1SMqz7';

async function setWebhook() {
    try {
        console.log('Fetching instances to set webhook...');
        const res = await axios.get(`${baseUrl}/instance/fetchInstances`, {
            headers: { 'admintoken': apiKey }
        });

        console.log(`Found ${res.data.length} instances.`);

        for (const instance of res.data) {
            const instanceName = instance.instance.instanceName;
            console.log(`\nSetting webhook for Instance: ${instanceName}`);

            try {
                // According to evolution-api docs (which UAZAPI is based on), we can set webhook like this
                const webhookRes = await axios.post(`${baseUrl}/webhook/set/${instanceName}`, {
                    url: "https://api.saltdigi.heysolu.com.br/api/v1/uazapi/webhook",
                    webhook_by_events: false,
                    webhook_base64: false,
                    events: [
                        "MESSAGES_UPSERT",
                        "MESSAGES_UPDATE",
                        "SEND_MESSAGE",
                        "CONNECTION_UPDATE",
                        "CALL"
                    ]
                }, {
                    headers: { 'admintoken': apiKey, 'Content-Type': 'application/json' }
                });

                console.log('Webhook Set Success:', webhookRes.data);
            } catch (e: any) {
                console.log('Error setting webhook:', e.response?.status, JSON.stringify(e.response?.data, null, 2));

                // Try alternative route (sometimes it's /settings/webhook)
                try {
                    const webhookRes2 = await axios.post(`${baseUrl}/settings/webhook/${instanceName}`, {
                        url: "https://api.saltdigi.heysolu.com.br/api/v1/uazapi/webhook",
                        events: ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "SEND_MESSAGE", "CONNECTION_UPDATE"]
                    }, {
                        headers: { 'admintoken': apiKey, 'Content-Type': 'application/json' }
                    });
                    console.log('Alternative Webhook Set Success:', webhookRes2.data);
                } catch (e2: any) {
                    console.log('Alternative Error:', e2.response?.status, JSON.stringify(e2.response?.data, null, 2));
                }
            }
        }

    } catch (error: any) {
        console.error('ERROR:', error.message);
    }
}

setWebhook();
