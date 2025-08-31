// frontend/tailwind.config.js
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:   "#1966B0", // primary
          cyan:   "#73D9F0", // accent
          yellow: "#F7B301", // correct
          orange: "#EB773E", // wrong
        },
        neutral: {
          border: "rgba(0,0,0,0.06)", 
        },
      },
      boxShadow: {
        card: "0 6px 24px rgba(0,0,0,0.06)",
        soft: "0 2px 10px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
  corePlugins: { preflight: false },
};
