import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'org.nativescript.nssolidcyber',
  appPath: 'src',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none'
  },
  cli: {
    additionalPathsToClean: ['.ns-vite-build']
  },
  bundler: 'vite',
  bundlerConfigPath: 'vite.config.mts'
} as NativeScriptConfig;
