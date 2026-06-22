# Hypermile Bengkel

Website bengkel body repair & detailing dengan Next.js, Zustand, Shadcn UI, Firebase (Auth & Firestore), dan pemesanan via WhatsApp.

## Tech Stack

- [Next.js](https://nextjs.org)
- [Next Auth](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [ShadCN UI](https://ui.shadcn.com/)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firestore](https://firebase.google.com/docs/firestore)
- [EmailJS](https://www.emailjs.com/)

## Features

- Autentikasi dengan Firebase Authentication + Next Auth
  - Sign up
  - Sign in
  - Forgot Password
- Katalog produk & layanan
- Keranjang belanja dengan pemesanan langsung via WhatsApp
- Panel admin untuk mengelola produk dan konten halaman

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Project on Firebase

Proyek ini menggunakan Firebase Authentication dan Firestore sebagai database.

Setelah setup, buka **Project Settings** > **Your Apps** > **Web App** untuk mendapatkan konfigurasi Firebase.

### 4. Create a `.env` file

Salin `.env.example` ke `.env` dan isi variabel yang diperlukan:

```plaintext
NEXT_PUBLIC_BASE_URL='http://localhost:3000'

NEXTAUTH_URL='http://localhost:3000'
NEXTAUTH_SECRET=''

NEXT_PUBLIC_FIREBASE_APIKEY=''
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=''
NEXT_PUBLIC_FIREBASE_PROJECTID=''
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=''
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=''
NEXT_PUBLIC_FIREBASE_APPID=''
NEXT_PUBLIC_FIREBASE_MEASUREMENTID=''

FIREBASE_CLIENT_EMAIL=''
FIREBASE_PRIVATE_KEY=''

NEXT_PUBLIC_EMAILJS_SERVICE_ID=''
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=''
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=''
```

Untuk `NEXTAUTH_SECRET`, generate dengan:

```bash
openssl rand -base64 32
```

### 5. Run the application

```bash
npm run dev
```

## Deployment

Ubah **NEXT_PUBLIC_BASE_URL** dan **NEXTAUTH_URL** sesuai URL production saat deploy.
