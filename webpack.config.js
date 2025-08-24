const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  name: 'mlf-ui',

  exposes: {
    './Routes': './src/app/app.routes.ts',
    './Module':'./src/app/app.routes.ts'
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: 'auto' }),
    'lucide-angular': {
      singleton: true,
      strictVersion: false,
      requiredVersion: false
    }
  },

});
