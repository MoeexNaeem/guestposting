import './globals.css';

export const metadata = {
  title: 'guestpost',
  icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
