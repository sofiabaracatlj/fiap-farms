const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  ...withModuleFederationPlugin({
    name: 'transaction-mfe',

    exposes: {
      './web-components': './src/bootstrap.ts',
    },

    shared: {
      "@angular/core": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "@angular/common": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "@angular/router": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "@angular/platform-browser": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "@angular/platform-browser-dynamic": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "@angular/animations": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "@angular/forms": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "rxjs": { singleton: true, strictVersion: false, requiredVersion: '~7.8.0' },
      "˜tailwind˜": { singleton: true, strictVersion: false, requiredVersion: '^3.4.17' },
      // Automatically share all other dependencies
      ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    },
  }),
  // plugins: [
  //   new MiniCssExtractPlugin({
  //     filename: '[name].css',
  //     chunkFilename: '[id].css',
  //   }),
  // ],
};
