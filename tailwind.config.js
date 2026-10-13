module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        error: '#ba1a1a',
        'surface-container': '#f1eee7',
        'on-tertiary-fixed': '#341100',
        'surface-container-lowest': '#ffffff',
        'on-primary-container': '#83a28e',
        primary: '#052215',
        secondary: '#406840',
        'surface-variant': '#e5e2db',
        'on-tertiary': '#ffffff',
        'secondary-fixed-dim': '#a5d2a2',
        'inverse-on-surface': '#f3f0e9',
        'on-error': '#ffffff',
        'on-secondary-fixed-variant': '#284f2a',
        'on-primary-fixed': '#042013',
        'on-surface-variant': '#424843',
        'surface-container-low': '#f6f3ec',
        'surface-bright': '#fcf9f2',
        'on-secondary-container': '#446c44',
        'secondary-fixed': '#c1eebc',
        'inverse-surface': '#31312c',
        'tertiary-fixed-dim': '#ffb692',
        tertiary: '#381200',
        'primary-container': '#1c3829',
        'tertiary-container': '#592200',
        'on-secondary': '#ffffff',
        'on-surface': '#1c1c18',
        'on-tertiary-container': '#e2824e',
        'primary-fixed-dim': '#aeceb9',
        'on-primary': '#ffffff',
        'on-tertiary-fixed-variant': '#793101',
        'outline-variant': '#c2c8c1',
        'surface-container-highest': '#e5e2db',
        'on-error-container': '#93000a',
        'on-background': '#1c1c18',
        'primary-fixed': '#caead4',
        'on-secondary-fixed': '#002106',
        'error-container': '#ffdad6',
        'secondary-container': '#beecb9',
        outline: '#727973',
        'surface-dim': '#dcdad3',
        'surface-tint': '#486553',
        'inverse-primary': '#aeceb9',
        surface: '#fcf9f2',
        'tertiary-fixed': '#ffdbcb',
        'surface-container-high': '#ebe8e1',
        'on-primary-fixed-variant': '#304d3d',
        background: '#fcf9f2',
      },
      borderRadius: {
        DEFAULT: '2px',
        lg: '4px',
        xl: '8px',
        full: '12px',
      },
      fontFamily: {
        'headline-lg': ['Newsreader_14pt-Regular'],
        'headline-lg-mobile': ['Newsreader_14pt-Regular'],
        'body-sm': ['Inter_18pt-Regular'],
        'label-sm': ['Inter_18pt-Regular'],
        display: ['Newsreader_14pt-Regular'],
        'label-md': ['Inter_18pt-Regular'],
        'title-sm': ['Inter_18pt-Regular'],
        'body-md': ['Inter_18pt-Regular'],
        telemetry: ['Inter_18pt-Regular'],
        'body-lg': ['Newsreader_14pt-Regular'],
        'title-md': ['Inter_18pt-Regular'],
        'headline-md': ['Newsreader_14pt-Regular'],
        'headline-sm': ['Newsreader_14pt-Regular'],
      },
      spacing: {
        'space-xs': '4px',
        'space-sm': '8px',
        'space-md': '16px',
        'space-lg': '24px',
        'space-xl': '40px',
        'gutter-mobile': '16px',
        gutter: '24px',
        'margin-mobile': '20px',
        margin: '40px',
      },

      fontSize: {
        'headline-lg': [
          '36px',
          {
            lineHeight: '44px',
            letterSpacing: '-0.54px',
            fontWeight: '500',
          },
        ],

        'headline-lg-mobile': [
          '28px',
          {
            lineHeight: '36px',
            letterSpacing: '-0.28px',
            fontWeight: '500',
          },
        ],

        'body-sm': [
          '12px',
          {
            lineHeight: '18px',
            fontWeight: '400',
          },
        ],

        'label-sm': [
          '12px',
          {
            lineHeight: '14px',
            letterSpacing: '0.8px',
            fontWeight: '600',
          },
        ],

        display: [
          '48px',
          {
            lineHeight: '56px',
            letterSpacing: '-0.96px',
            fontWeight: '500',
          },
        ],

        'label-md': [
          '20px',
          {
            lineHeight: '16px',
            letterSpacing: '0.72px',
            fontWeight: '600',
          },
        ],

        'title-sm': [
          '14px',
          {
            lineHeight: '20px',
            letterSpacing: '0.14px',
            fontWeight: '600',
          },
        ],

        'body-md': [
          '14px',
          {
            lineHeight: '22px',
            fontWeight: '400',
          },
        ],

        telemetry: [
          '13px',
          {
            lineHeight: '16px',
            letterSpacing: '0.52px',
            fontWeight: '500',
          },
        ],

        'body-lg': [
          '18px',
          {
            lineHeight: '28px',
            fontWeight: '400',
          },
        ],

        'title-md': [
          '16px',
          {
            lineHeight: '24px',
            letterSpacing: '-0.08px',
            fontWeight: '600',
          },
        ],

        'headline-md': [
          '24px',
          {
            lineHeight: '32px',
            letterSpacing: '-0.24px',
            fontWeight: '600',
          },
        ],

        'headline-sm': [
          '20px',
          {
            lineHeight: '28px',
            fontWeight: '600',
          },
        ],
      },
    },
  },
  plugins: [],
};
