const fs = require('fs');
const path = require('path');
const http = require('http');

const CLAIM_DATA = JSON.stringify({
    insurance_type: 'health',
    policy_id: 'TEST-POL-123',
    claim_amount: 1000,
    description: 'Phase 3 Verification Claim',
    incident_date: '2026-02-19'
});

function request(options, bodyBuffer) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
        });
        req.on('error', reject);
        if (bodyBuffer) req.write(bodyBuffer);
        req.end();
    });
}

async function verify() {
    console.log('🚀 Starting Phase 3 Verification...');

    // 1. Create Claim
    console.log('1️⃣ Creating test claim...');
    const createRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/claims',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': CLAIM_DATA.length
        }
    }, CLAIM_DATA);

    if (createRes.statusCode !== 201) {
        throw new Error(`Failed to create claim: ${JSON.stringify(createRes.body)}`);
    }
    const claimId = createRes.body.claim.id;
    console.log(`✅ Claim created: ${claimId}`);

    // 2. Upload Evidence (Mocking Multipart)
    console.log('2️⃣ Uploading evidence file...');
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const filePath = path.join(__dirname, 'dummy_evidence.pdf');
    const fileContent = fs.readFileSync(filePath);

    const preamble = `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="dummy_evidence.pdf"\r\nContent-Type: application/pdf\r\n\r\n`;
    const epilogue = `\r\n--${boundary}--`;

    const bodyBuffer = Buffer.concat([
        Buffer.from(preamble),
        fileContent,
        Buffer.from(epilogue)
    ]);

    const uploadRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/claims/${claimId}/evidence`,
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': bodyBuffer.length
        }
    }, bodyBuffer);

    if (uploadRes.statusCode !== 201) {
        throw new Error(`Failed to upload evidence: ${JSON.stringify(uploadRes.body)}`);
    }
    console.log('✅ Evidence uploaded successfully');
    console.log(`   Completeness Score: ${uploadRes.body.completenessScore}`);
    console.log(`   File URL: ${uploadRes.body.evidence[0].file_url}`);

    // 3. Verify File on Disk
    const relativeUrl = uploadRes.body.evidence[0].file_url.replace(/^\//, ''); // remove leading slash
    const uploadedPath = path.join(__dirname, relativeUrl);
    if (fs.existsSync(uploadedPath)) {
        console.log(`✅ File verified on disk: ${uploadedPath}`);
    } else {
        throw new Error(`File NOT found on disk at: ${uploadedPath}`);
    }

    console.log('🎉 PHASE 3 VERIFICATION PASSED');
}

verify().catch(err => {
    console.error('❌ Verification Failed:', err);
    process.exit(1);
});
