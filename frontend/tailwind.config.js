/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      /* ── Supanova 스페이싱 ── */
      spacing: {
        'gutter': '16px',
        'section': '24px',
      },

      /* ── Supanova 모서리 둥글기 ── */
      borderRadius: {
        'card': '24px',
        'button': '9999px',
        'modal': '32px',
        'premium': '2rem',
      },

      /* ── Paperlogy 폰트 패밀리 ── */
      fontFamily: {
        'paperlogy': ['Paperlogy-Regular'],
        'paperlogy-medium': ['Paperlogy-Medium'],
        'paperlogy-semibold': ['Paperlogy-SemiBold'],
        'paperlogy-bold': ['Paperlogy-Bold'],
        'paperlogy-extrabold': ['Paperlogy-ExtraBold'],
      },

      /* ── Supanova 타이포그래피 ── */
      fontSize: {
        'heading-1': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-2': ['22px', { lineHeight: '30px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-3': ['18px', { lineHeight: '26px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'body': ['15px', { lineHeight: '22px' }],
        'caption': ['12px', { lineHeight: '16px' }],
      },

      /* ── Supanova 그림자 ── */
      boxShadow: {
        'card': '0 2px 12px -4px rgba(0, 0, 0, 0.06)',
        'premium': '0 20px 60px -15px rgba(255, 127, 80, 0.08)',
      },

      /* ── Supanova 애니메이션 ── */
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      /* ── 색상 시스템 ── */
      colors: {
        primary: {
          DEFAULT: '#FF7F50', // Coral
          light: '#FFAB91',
          dark: '#E64A19',
        },
        secondary: {
          DEFAULT: '#4DB6AC', // Soft Teal
        },
        vote: '#5C6BC0', // Indigo
        toss: {
          blue: '#3182f6',
          gray: {
            DEFAULT: '#4e5968',
            dark: '#191f28',
            light: '#8b95a1',
            input: '#f2f4f6',
          },
          bg: '#f9fafb',
          success: '#2da07a',
          error: '#f04452',
        }
      }
    },
  },
  darkMode: "class",
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
