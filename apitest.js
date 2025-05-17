const https = require('https');
const querystring = require('querystring');

async function authBradesco() {
    const client_id = '123';
    const client_secret = 'senhateste'; 

    const apiUrl = 'qrpix-h.bradesco.com.br';
    const authPath = '/auth/server/oauth/token';

    const authString = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const postData = querystring.stringify({
        grant_type: 'client_credentials',
        scope: ''
    });

    const options = {
        hostname: apiUrl,
        path: authPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${authString}`,
            'Content-Length': postData.length
        },
        // clientCertificateP12: fs.readFileSync('path'), // Ou cert e key separadamente
        // certPass: 'senha do certificado',
        // cert: fs.readFileSync('path'),
        // key: fs.readFileSync('path')
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (content) => {
                data += content;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('Resposta: ', jsonData);
                    resolve(jsonData);
                } catch (error) {
                    console.error('Erro na resposta: ', error);
                    reject(error);
                }
            });
        }).on('error', (error) => {
            console.error('Erro na requisição: ', error);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function criarCobrança(accessToken, txid, payloadCobranca) {
    const apiUrlCobranca = `https://qrpix-h.bradesco.com.br/cob/${txid}`;

    try {
        const response = await fetch(apiUrlCobranca, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}` // Incluindo o token
            },
            body: JSON.stringify(payloadCobranca)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error(`Erro ao criar cobrança (txid: ${txid}):`, errorBody);
            throw new Error(`Erro na requisição (txid: ${txid}): ${response.status}`);
        }

        const data = await response.json();
        console.log(`Cobrança criada com sucesso (txid: ${txid}):`, data);
        return data;
    } catch (error) {
        console.error(`Erro ao criar cobrança (txid: ${txid}):`, error);
        throw error;
    }
}

async function main() {
    try {
        const tokenData = await authBradesco();
        if (tokenData && tokenData.access_token) {
            console.log('Token de acesso recebido:', tokenData.access_token);
            //  Aqui vão as chamadas para os endpoints da API Pix
        }
    } catch (error) {
        console.error('Falha na autenticação:', error);
    }
}

main();