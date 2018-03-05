// Please rename this file config.js

module.exports = {
  db: {
    user: 'admin', // Provide db's user
    password: 'admin', // Provide db's password
    host: 'ds029778.mlab.com', // Provide db's host
    port: '29778', // Provide db's host port, by default i's 27017
    name: 'bars-db' // Provide db's name
  },
  jwtSecret: 'noussommesconnectés', // Provide secret passphrase of JWT
  server: {
    host: 'http://localhost', // Provide host server
    port: '4211' // Provide server's port
  }
}
