#!/usr/bin/env node

/**
 * Antideploy Deployment Script for ResQEarth
 * Automatically packages and deploys the Next.js frontend to Antideploy.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const APP_ID = process.env.ANTIDEPLOY_APP_ID || 'b179ff75-78f9-4146-8e2c-e84b94e429d8';
const configPath = path.join(os.homedir(), '.antideploy', 'config.json');

function getToken() {
  if (process.env.ANTIDEPLOY_TOKEN) {
    return process.env.ANTIDEPLOY_TOKEN;
  }
  if (!fs.existsSync(configPath)) {
    console.error('No Antideploy token found. Run the Antideploy device flow or set ANTIDEPLOY_TOKEN.');
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return config.token;
}

const rootDir = path.resolve(__dirname, '..');
const tarPath = path.join(os.tmpdir(), `resqearth-deploy-${Date.now()}.tar.gz`);

console.log('Packaging ResQEarth for Antideploy...');
console.log('Directory:', rootDir);

// Create tarball
try {
  execSync(`tar -czf "${tarPath}" --exclude=node_modules --exclude=.next --exclude=.git -C "${rootDir}" .`);
} catch (e) {
  // Fallback for Windows if tar is tar.exe
  execSync(`tar.exe -czf "${tarPath}" --exclude=node_modules --exclude=.next --exclude=.git -C "${rootDir}" .`);
}

const stats = fs.statSync(tarPath);
console.log(`Package created: ${(stats.size / 1024).toFixed(1)} KB`);

async function deploy() {
  const token = getToken();
  const fileBuffer = fs.readFileSync(tarPath);
  const blob = new Blob([fileBuffer], { type: 'application/gzip' });

  const formData = new FormData();
  formData.append('archive', blob, 'resqearth.tar.gz');

  console.log(`Triggering deployment (applicationId: ${APP_ID})...`);

  const res = await fetch(`https://antideploy.com/api/v1/deploy?applicationId=${APP_ID}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 202) {
    console.error('Deployment rejected:', data);
    try { fs.unlinkSync(tarPath); } catch (_) {}
    process.exit(1);
  }

  const taskId = data.taskId;
  console.log(`Deployment task queued: ${taskId}`);
  console.log(`Dashboard: https://antideploy.com/app/${APP_ID}`);
  console.log('Polling deployment progress...\n');

  let attempts = 0;
  while (attempts < 300) {
    attempts++;
    await new Promise(r => setTimeout(r, 3000));

    try {
      const pollRes = await fetch(`https://antideploy.com/api/v1/deployments/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pollData = await pollRes.json().catch(() => ({}));
      const status = pollData.status || pollData.deployment?.status;

      process.stdout.write(`\r[${attempts * 3}s] Status: ${status || 'running'}...`);

      if (status === 'succeeded' || status === 'live') {
        console.log('\n\n=============================================');
        console.log('DEPLOYMENT SUCCEEDED!');
        console.log('Live URL:', pollData.url || pollData.deployment?.url || 'https://resqearth.antideploy.app');
        console.log('=============================================\n');
        break;
      }

      if (status === 'failed') {
        console.error('\n\n=============================================');
        console.error('DEPLOYMENT FAILED:');
        console.error('Error:', pollData.error);
        console.error('Failed step:', pollData.failedStep);
        console.error('=============================================\n');
        try { fs.unlinkSync(tarPath); } catch (_) {}
        process.exit(1);
      }
    } catch (err) {
      // transient network error, continue polling
    }
  }

  try { fs.unlinkSync(tarPath); } catch (_) {}
}

deploy().catch(err => {
  console.error('Deployment error:', err.message);
  try { fs.unlinkSync(tarPath); } catch (_) {}
  process.exit(1);
});
