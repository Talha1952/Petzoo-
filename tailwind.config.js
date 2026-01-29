export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#EA580C', // Orange-600
                'primary-dark': '#C2410C', // Orange-700
                accent: '#FF8F00',
                danger: '#d32f2f',
                light: '#f5f5f5',
                dark: '#212121',
            },
            fontFamily: {
                sans: ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
