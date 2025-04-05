import path from 'path';

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`;

const prettierCommand = 'prettier --write --ignore-unknown';

const jsGlob = '*.{js,jsx,ts,tsx}';

const config = {};

config[jsGlob] = [buildEslintCommand, prettierCommand];
config[`!(${jsGlob})`] = prettierCommand;

export default config;
