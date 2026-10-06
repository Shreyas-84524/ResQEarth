#!/usr/bin/env node

/**
 * ResQEarth Admin Account Provisioning Script
 * Usage: node scripts/create-admin.js <email> <password> [name] [phone]
 * Example: node scripts/create-admin.js admin@resqearth.org Admin@12345 "EOC Administrator" "+919876543210"
 */

const fs = require('fs');
const path = require('path');

// Read .env.local or .env for Firebase credentials
const envPath = path.resolve(__dirname, '..', '.env.local');
const fallbackEnvPath = path.resolve(__dirname, '..', '.env');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        env[key] = val;
      }
    }
  });
  return env;
}

const env = { ...loadEnv(fallbackEnvPath), ...loadEnv(envPath), ...process.env };

const FIREBASE_API_KEY = env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const [,, email, password, name = 'ResQEarth Administrator', phone = '+919876543210'] = process.argv;

if (!email || !password) {
  console.log(`
=====================================================
 ResQEarth Admin Account Provisioning
=====================================================
Usage:
  node scripts/create-admin.js <email> <password> [name] [phone]

Example:
  node scripts/create-admin.js admin@resqearth.org SafePassword#2026 "Chief Disaster Officer" "+919876543210"
=====================================================
`);
  process.exit(0);
}

if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
  console.error('[Error] Firebase API Key or Project ID missing in .env.local / .env');
  process.exit(1);
}

async function provisionAdmin() {
  console.log(`\nProvisioning Admin account in Firebase Project: ${FIREBASE_PROJECT_ID}`);
  console.log(`Email: ${email}`);
  console.log(`Role: admin`);

  try {
    // 1. Create or Sign In User with Firebase Auth REST API
    let idToken, localId;

    const signUpRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const signUpData = await signUpRes.json();

    if (signUpRes.ok) {
      console.log('✓ Firebase Auth account created successfully.');
      idToken = signUpData.idToken;
      localId = signUpData.localId;
    } else if (signUpData.error?.message?.includes('EMAIL_EXISTS')) {
      console.log('Account already exists in Firebase Auth. Signing in to update Firestore role...');
      const signInRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );
      const signInData = await signInRes.json();
      if (!signInRes.ok) {
        throw new Error(`Auth sign-in failed: ${signInData.error?.message}`);
      }
      idToken = signInData.idToken;
      localId = signInData.localId;
    } else {
      throw new Error(`Auth signup failed: ${signUpData.error?.message}`);
    }

    // 2. Set user display name
    await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          displayName: name,
          returnSecureToken: true,
        }),
      }
    );

    // 3. Upsert Firestore document in `users/{uid}` with role: 'admin'
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${localId}?updateMask.fieldPaths=uid&updateMask.fieldPaths=name&updateMask.fieldPaths=email&updateMask.fieldPaths=phone&updateMask.fieldPaths=role&updateMask.fieldPaths=notificationConsent&updateMask.fieldPaths=smsConsent&updateMask.fieldPaths=updatedAt`;

    const now = new Date().toISOString();
    const firestoreDoc = {
      fields: {
        uid: { stringValue: localId },
        name: { stringValue: name },
        email: { stringValue: email },
        phone: { stringValue: phone },
        role: { stringValue: 'admin' },
        notificationConsent: { booleanValue: true },
        smsConsent: { booleanValue: true },
        updatedAt: { stringValue: now },
      },
    };

    const fsRes = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(firestoreDoc),
    });

    if (!fsRes.ok) {
      const fsErr = await fsRes.json().catch(() => ({}));
      console.warn(`[Notice] Firestore patch status: ${fsRes.status}. Details:`, fsErr);
    } else {
      console.log('✓ Firestore profile document updated with role: "admin".');
    }

    console.log('\n=====================================================');
    console.log(' ADMIN PROVISIONING COMPLETE');
    console.log('=====================================================');
    console.log(`Email: ${email}`);
    console.log(`UID:   ${localId}`);
    console.log(`Role:  admin`);
    console.log('You can now log in at /login to access /admin.');
    console.log('=====================================================\n');
  } catch (error) {
    console.error('\n[Provisioning Error]:', error.message);
    process.exit(1);
  }
}

provisionAdmin();
