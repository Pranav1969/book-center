import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.karunabooks.app',
  appName: 'Karuna-books',
  webDir: 'public',
  server: {
    url: 'https://book-center-smoky.vercel.app',
    cleartext: true
  }
};

export default config;