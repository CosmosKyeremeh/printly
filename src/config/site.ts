Set-Content -Path "src/config/site.ts" -Value @"
export const siteConfig = {
  name: 'ClassPrint Hub',
  description: 'Centralized assignment submission and printing for your class.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  version: '0.1.0',
};
"@