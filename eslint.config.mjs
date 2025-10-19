import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Define __filename and __dirname for compatibility in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize FlatCompat for loading legacy configuration formats
const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname, // Ensure plugins are resolved correctly
});

// Define the complete ESLint configuration array
const eslintConfig = [
  // Import legacy configurations from Next.js (required for proper setup)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Configuration for files to ignore
  {
    // Ignores are crucial for performance and stability in Next.js projects
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts", // Typically handled automatically, but good to ignore
      "**/*.config.js", // Often useful to ignore config files themselves
    ],
  },
  
  // Optional: Add specific project rules here if needed, for example:
  // {
  //   files: ["**/*.{js,jsx,ts,tsx}"],
  //   rules: {
  //     "react/jsx-key": "error", // Ensure every map returns a key
  //     // Add any other custom rules
  //   }
  // }
];

export default eslintConfig;
