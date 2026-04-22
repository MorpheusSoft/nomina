"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require('jsonwebtoken');
async function run() {
    const token = jwt.sign({ sub: 'user-1', tenantId: 'cb43998c-3e21-4a6e-a2d6-ccbfdc9cf492' }, process.env.JWT_SECRET || 'nebulapay_super_secret_key_2026', { expiresIn: '12h' });
    try {
        const res = await fetch('http://127.0.0.1:3002/api/v1/document-templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Prueba',
                type: 'WORK_LETTER',
                isSelfService: true,
                contentHtml: 'Hola'
            })
        });
        const text = await res.text();
        console.log('Status:', res.status, 'Body:', text);
    }
    catch (err) {
        console.error('Error:', err);
    }
}
run();
//# sourceMappingURL=test-error.js.map