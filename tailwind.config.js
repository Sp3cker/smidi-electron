// tailwind.config.mjs
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  theme: {
    extend: {
      colors: {
        neir: "var(--color-neir)",
        "neir-light": "var(--color-neir-light)",
        "neir-lighter": "var(--color-neir-lighter)",
        "neir-lightest": "var(--color-neir-lightest)",
        "neir-dark": "var(--color-neir-dark)",
        "neir-darker": "var(--color-neir-darker)",
        "neir-darkest": "var(--color-neir-darkest)",
      },
    },
  },
  // ...rest of config
};
