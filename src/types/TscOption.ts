interface TscOption {
  target: string,
  module: string,
  inlineSourceMap: boolean,
  outDir: string,
  removeComments: boolean,
  esModuleInterop: boolean,
  forceConsistentCasingInFileNames: boolean,
  strict: boolean,
  skipLibCheck: boolean;
}

export { TscOption };