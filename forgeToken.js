const crypto = require('crypto');

function base64url(str) {
    return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

const header = {
    alg: 'HS256',
    typ: 'JWT'
};

const payload = {
    sub: 'fakeadmin@test.com', // wait, does it use email?
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60)
};

const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));

const secret = '9a4f2c8d3b7a1e6f45c8a0b3f267d8b1d4e6f3c8a9d2b5f8e3a9c8b5f6v8a3d9';
const signature = crypto.createHmac('sha256', Buffer.from(secret, 'utf-8')).update(`${encodedHeader}.${encodedPayload}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

console.log(`${encodedHeader}.${encodedPayload}.${signature}`);
