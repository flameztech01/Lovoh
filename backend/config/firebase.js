import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

console.log('FIREBASE_PROJECT_ID:', projectId ? 'SET' : 'MISSING');
console.log('FIREBASE_CLIENT_EMAIL:', clientEmail ? 'SET' : 'MISSING');
console.log('FIREBASE_PRIVATE_KEY raw length:', privateKey ? privateKey.length : 0);

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Missing Firebase environment variables.');
}

// Replace literal \n with actual newlines
privateKey = privateKey.replace(/\\n/g, '\n');

// If the key still doesn't look valid, throw a clear error
if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
  throw new Error('FIREBASE_PRIVATE_KEY is not in the expected format.');
}

const serviceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;