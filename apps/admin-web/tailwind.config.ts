module.exports = {
  presets: [require('@athlete-planner/config-tailwind')],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/ui/**/*.{ts,tsx}',
  ],
};
