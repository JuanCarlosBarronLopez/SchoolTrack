// vue.config.js
module.exports = {
  chainWebpack: config => {
    // 1. Desactiva el plugin de copia automática de archivos estáticos ('public')
    // Esto es lo que escanea recursivamente y encuentra el duplicado en node_modules.
    config.plugins.delete('copy');

    // 2. Fuerza el plugin HTML a usar SÓLO la plantilla correcta.
    config.plugin('html').tap(args => {
      args[0].template = 'public/index.html';
      return args;
    });
  }
};