interface TscOption {
  target: string,
  module: string,
  sourceMap: boolean,
  outDir: string,
  removeComments: boolean,
  esModuleInterop: boolean,
  forceConsistentCasingInFileNames: boolean,
  strict: boolean,
  skipLibCheck: boolean;
  [key: string]: string | boolean;
}

export { TscOption };