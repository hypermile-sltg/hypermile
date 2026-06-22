import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  Firestore,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
}

const app = initializeApp(firebaseConfig)

let db: Firestore

if (typeof window !== 'undefined') {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  })
  
  // @ts-ignore
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = true
  // Tambahkan setting global untuk koneksi lambat
  ;(globalThis as any).process = { ...process, env: { ...process.env, FIRESTORE_LONG_POLLING: 'true' } }
} else {
  db = getFirestore(app)
}

const auth = getAuth(app)

export { app, auth, db }