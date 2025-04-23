/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Dominios de Google para imágenes de perfil
      'source.boringavatars.com',  // Avatares generados para reviewers
      'gedftgamwlkbwmdwyovk.supabase.co', // Dominio de Supabase Storage para imágenes de tableros
    ],
  },
};

module.exports = nextConfig;
