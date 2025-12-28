# Rashin한국 말누리 센터 - Learning Management System

A modern learning management system for language courses.

## Environment Configuration

The application uses environment-specific configuration for API URLs, authentication, and other settings. These settings are centralized in the `config/env.ts` file.

### Local Development

For local development, the application uses the following default settings:
- API URL: `http://localhost:9091/api`
- Token key: `token`

### Production Deployment

For production deployment, you can override the default settings by setting the following environment variables:

```bash
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
```

## Development

First, install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication

The application uses JWT authentication. The token is stored in the localStorage with the key specified in the environment configuration (`token` by default).

## API Integration

The application connects to a backend API. Ensure the API server is running at the URL specified in your environment configuration. 