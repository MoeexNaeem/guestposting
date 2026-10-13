/** @type {import('next').NextConfig} */
const nextConfig = {
  // The Vite build ran the React Compiler; keep it so components behave the same.
  reactCompiler: true,
  serverExternalPackages: ['nodemailer', 'csv-parser'],
};

export default nextConfig;
