#!/usr/bin/env node
/**
 * V2 Schema Contract Test
 * Validates that /api/chat/ask returns proper V2 schema
 */

const Ajv = require('ajv');
const fs = require('fs');
const https = require('https');

const API_BASE = process.env.API_BASE || 'https://ai-hotfix-prod.preview.emergentagent.com';
const schema = JSON.parse(fs.readFileSync('./schema/ChatResponseV2.json', 'utf8'));

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

async function testChatResponse() {
  console.log('🧪 Testing V2 Schema Contract...');
  
  const payload = JSON.stringify({
    question: "When is a building surveyor required for approval?",
    session_id: "contract_test"
  });
  
  const options = {
    hostname: new URL(API_BASE).hostname,
    port: 443,
    path: '/api/chat/ask',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo_token',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          console.log('✅ Received response from API');
          console.log('📋 Response keys:', Object.keys(response));
          console.log('🔍 Schema version:', response.meta?.schema);
          console.log('📏 Content length:', response.blocks?.[0]?.content?.length);
          
          if (!validate(response)) {
            console.error('❌ V2 Schema validation failed:');
            console.error(validate.errors);
            process.exit(1);
          }
          
          console.log('🎉 V2 Schema validation PASSED');
          resolve(response);
        } catch (error) {
          console.error('❌ JSON parse error:', error.message);
          console.error('Raw response:', data);
          process.exit(1);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      process.exit(1);
    });
    
    req.write(payload);
    req.end();
  });
}

testChatResponse().then(() => {
  console.log('✅ Contract test PASSED - V2 schema enforced');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Contract test FAILED:', error.message);
  process.exit(1);
});