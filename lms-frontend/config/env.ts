/**
 * Environment configuration for the application
 * This centralizes all environment-specific values
 */

type Environment = 'development' | 'production' | 'test';

// Determine current environment
const getEnvironment = (): Environment => {
  const env = process.env.NODE_ENV || 'development';
  return env as Environment;
};

// Environment-specific configuration
const envConfig = {
  development: {
    apiUrl: 'http://localhost:9091/api',
    tokenKey: 'token',
    appName: 'Rashin한국 말누리 센터'
  },
  production: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://lms.rashinhanguk.com/api',
    tokenKey: 'token',
    appName: 'Rashin한국 말누리 센터 | Learning Management System'
  },
  test: {
    apiUrl: 'http://localhost:9091/api',
    tokenKey: 'token',
    appName: 'Rashin한국 말누리 센터'
  }
};

// Current environment configuration
const currentEnv = getEnvironment();
const config = envConfig[currentEnv];

export default {
  // API related
  apiUrl: config.apiUrl,
  
  // Authentication related
  tokenKey: config.tokenKey,
  
  // Application related
  appName: config.appName,
  
  // Current environment
  environment: currentEnv,
  isDevelopment: currentEnv === 'development',
  isProduction: currentEnv === 'production',
  isTest: currentEnv === 'test'
}; 