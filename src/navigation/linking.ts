/**
 * Deep Linking Configuration
 * Define las rutas accesibles desde URLs externas
 */

const prefix = 'myapp://';

export const linking = {
  prefixes: [prefix, 'myapp://', 'https://myapp.com'],

  config: {
    screens: {
      // Pantallas de autenticación
      Login: 'login',
      Signup: 'signup',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password/:token',

      // Pantallas protegidas
      Dashboard: 'dashboard',
      Profile: 'profile/:userId',
      Settings: 'settings',
      Post: 'post/:postId',
      Search: 'search/:query',

      // Pantalla de carga
      Splash: 'splash',

      // Página no encontrada (404)
      NotFound: '*',
    },
  },
};

/**
 * Ejemplos de URLs:
 *
 * Autenticación:
 * - myapp://login
 * - myapp://signup
 * - myapp://forgot-password
 *
 * Protegidas:
 * - myapp://dashboard
 * - myapp://profile/123
 * - myapp://settings
 * - myapp://post/456
 * - myapp://search/react%20native
 *
 * Web:
 * - https://myapp.com/login
 * - https://myapp.com/profile/123
 */
