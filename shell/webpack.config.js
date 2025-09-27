const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  ...withModuleFederationPlugin({
    shared: {
      "@angular/core": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "@angular/common": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "@angular/router": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "@angular/platform-browser": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "@angular/platform-browser-dynamic": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "@angular/animations": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "@angular/forms": { singleton: true, strictVersion: true, requiredVersion: '15.2.0' },
      "rxjs": { singleton: true, strictVersion: false, requiredVersion: '~7.8.0' },
    
      // "zone.js": { singleton: true, strictVersion: false, requiredVersion: '~0.12.0' },
      // Automatically share all other dependencies
      ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    },
  }),

  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].css' }),
  ],

  module: {
    rules: [
      // Rule for global styles (styles.css or styles.scss)
      {
        test: /\.(css|scss)$/,
        include: /src\/styles/, // Only process global styles
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
};
