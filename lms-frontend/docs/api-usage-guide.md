# API Usage Guide

This guide explains how to use the environment configuration and API utilities in the application.

## Environment Configuration

The application uses a centralized environment configuration system to manage environment-specific values like API URLs and authentication token keys. This allows for easy switching between development and production environments.

### Using the Environment Configuration

Import the environment configuration:

```typescript
import env from "@/config/env";
```

Access configuration values:

```typescript
// API URL
const apiUrl = env.apiUrl;

// Token key
const tokenKey = env.tokenKey;

// Check environment
if (env.isDevelopment) {
  console.log("Running in development mode");
}
```

## API Utilities

The application provides a set of utility functions for making API calls. These utilities automatically handle authentication and error handling.

### API Request Functions

Import the API utilities:

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-utils";
```

#### GET Requests

```typescript
// Define your response interface
interface User {
  id: number;
  name: string;
  email: string;
}

// Make a GET request
const fetchUser = async (userId: number) => {
  try {
    const user = await apiGet<User>(`users/${userId}`);
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};
```

#### POST Requests

```typescript
// Define your request and response interfaces
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

interface CreateUserResponse {
  id: number;
  name: string;
  email: string;
}

// Make a POST request
const createUser = async (userData: CreateUserRequest) => {
  try {
    const newUser = await apiPost<CreateUserResponse>('users', userData);
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
```

#### PUT Requests

```typescript
// Make a PUT request
const updateUser = async (userId: number, userData: Partial<User>) => {
  try {
    const updatedUser = await apiPut<User>(`users/${userId}`, userData);
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
```

#### DELETE Requests

```typescript
// Make a DELETE request
const deleteUser = async (userId: number) => {
  try {
    await apiDelete(`users/${userId}`);
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
```

## Authentication

All API utilities automatically include the authentication token in the request headers. The token is retrieved from localStorage using the key specified in the environment configuration.

### Manual Token Access

If you need to access the token manually:

```typescript
import { getToken } from "@/lib/auth";

const token = getToken();
```

### Storing and Removing Tokens

```typescript
// Storing a token (typically done in the login function)
localStorage.setItem(env.tokenKey, token);

// Removing a token (typically done in the logout function)
localStorage.removeItem(env.tokenKey);
```

## URL Building

If you need to build a full API URL manually:

```typescript
import { buildApiUrl } from "@/lib/api-utils";

const url = buildApiUrl('users/current');
// Result: http://localhost:9091/api/users/current (in development)
```

## Error Handling

All API utilities will throw an error if the request fails. You should always wrap API calls in try/catch blocks to handle errors gracefully.

```typescript
try {
  const data = await apiGet<DataType>('endpoint');
  // Handle success
} catch (error) {
  // Handle error
  if (error instanceof Error) {
    if (error.message.includes('401')) {
      // Handle authentication error
      // For example, redirect to login page
    } else {
      // Handle other errors
    }
  }
}
``` 