// frontend/tailwind.config.js
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        card: "0 6px 24px rgba(0,0,0,0.06)",   
        soft: "0 2px 10px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
  corePlugins: { preflight: false },
};
