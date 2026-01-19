# API Reference

This document provides the API reference for the FlashFusion platform.

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Health](#health)
  - [Authentication](#authentication-endpoints)
  - [App Generations](#app-generations)
  - [Deployments](#deployments)

---

## Overview

The FlashFusion API is a RESTful API that uses JSON for request and response bodies. All endpoints require HTTPS.

### API Versioning

The API is currently unversioned. Breaking changes will be communicated in advance through the changelog.

---

## Authentication

### Authentication Methods

The API supports two authentication methods:

1. **Session Cookies** (Browser clients)
   - Automatically managed by Supabase Auth
   - HTTP-only cookies for security

2. **Bearer Tokens** (API clients)
   ```
   Authorization: Bearer <access_token>
   ```

### Obtaining Access Tokens

Access tokens are obtained through Supabase Auth:

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

const accessToken = data.session.access_token;
```

### Token Refresh

Tokens expire after 1 hour. Use the refresh token to obtain a new access token:

```typescript
const { data, error } = await supabase.auth.refreshSession();
```

---

## Base URL

| Environment | Base URL |
|-------------|----------|
| Production | `https://flashfusion.vercel.app/api` |
| Staging | `https://staging.flashfusion.vercel.app/api` |
| Local | `http://localhost:3000/api` |

---

## Response Format

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-22T14:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2025-11-22T14:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication required or failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |
| `SERVICE_UNAVAILABLE` | Dependent service unavailable |

---

## Rate Limiting

### Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Read operations | 100 requests | 1 minute |
| Write operations | 20 requests | 1 minute |
| Authentication | 10 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1637000000
```

### Handling Rate Limits

When rate limited, wait for the `Retry-After` header duration:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

---

## Endpoints

### Health

#### GET /health

Check the health status of the API and its dependencies.

**Authentication**: Not required

**Request**:
```bash
curl -X GET https://flashfusion.vercel.app/api/health
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T14:30:00Z",
  "version": "0.1.0",
  "checks": {
    "database": {
      "status": "connected",
      "latency": 12
    },
    "auth": {
      "status": "operational"
    }
  }
}
```

**Response** (503 Service Unavailable):
```json
{
  "status": "unhealthy",
  "timestamp": "2025-11-22T14:30:00Z",
  "checks": {
    "database": {
      "status": "disconnected",
      "error": "Connection timeout"
    }
  }
}
```

---

### Authentication Endpoints

#### POST /auth/signup

Create a new user account.

**Request**:
```bash
curl -X POST https://flashfusion.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "displayName": "John Doe"
  }'
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| password | string | Yes | Minimum 8 characters |
| displayName | string | No | User's display name |

**Response** (201 Created):
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "John Doe"
    },
    "session": {
      "accessToken": "eyJ...",
      "refreshToken": "abc...",
      "expiresAt": 1637000000
    }
  }
}
```

#### POST /auth/login

Authenticate an existing user.

**Request**:
```bash
curl -X POST https://flashfusion.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

**Response** (200 OK):
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "session": {
      "accessToken": "eyJ...",
      "refreshToken": "abc...",
      "expiresAt": 1637000000
    }
  }
}
```

#### POST /auth/logout

End the current session.

**Authentication**: Required

**Request**:
```bash
curl -X POST https://flashfusion.vercel.app/api/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

**Response** (200 OK):
```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### App Generations

#### POST /generate

Start a new app generation request.

**Authentication**: Required

**Request**:
```bash
curl -X POST https://flashfusion.vercel.app/api/generate \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "my-awesome-app",
    "platform": "web",
    "framework": "nextjs",
    "config": {
      "features": ["auth", "database", "api"],
      "styling": "tailwind",
      "auth": "supabase"
    }
  }'
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| appName | string | Yes | Application name (alphanumeric, hyphens) |
| platform | string | Yes | Target platform: web, mobile, desktop, edge |
| framework | string | Yes | Framework: nextjs, react, flutter, tauri |
| config | object | Yes | Generation configuration |

**Config Object**:
| Field | Type | Description |
|-------|------|-------------|
| features | string[] | Features to include |
| styling | string | CSS framework: tailwind, mui, chakra |
| auth | string | Auth provider: supabase, firebase, auth0 |
| database | string | Database: supabase, firebase, postgres |

**Response** (201 Created):
```json
{
  "data": {
    "id": "gen_abc123",
    "appName": "my-awesome-app",
    "status": "pending",
    "progress": 0,
    "createdAt": "2025-11-22T14:30:00Z"
  }
}
```

#### GET /generate/:id

Get the status of a generation request.

**Authentication**: Required

**Request**:
```bash
curl -X GET https://flashfusion.vercel.app/api/generate/gen_abc123 \
  -H "Authorization: Bearer <access_token>"
```

**Response** (200 OK):
```json
{
  "data": {
    "id": "gen_abc123",
    "appName": "my-awesome-app",
    "status": "generating",
    "progress": 45,
    "logs": [
      "Validating configuration...",
      "Scaffolding project structure...",
      "Installing dependencies..."
    ],
    "createdAt": "2025-11-22T14:30:00Z",
    "updatedAt": "2025-11-22T14:31:00Z"
  }
}
```

**Status Values**:
| Status | Description |
|--------|-------------|
| pending | Queued for processing |
| validating | Validating configuration |
| generating | Building the application |
| completed | Generation successful |
| failed | Generation failed |

#### GET /generate/:id/download

Download the generated application.

**Authentication**: Required

**Request**:
```bash
curl -X GET https://flashfusion.vercel.app/api/generate/gen_abc123/download \
  -H "Authorization: Bearer <access_token>" \
  -o my-app.zip
```

**Response**: Binary ZIP file

**Response Headers**:
```
Content-Type: application/zip
Content-Disposition: attachment; filename="my-awesome-app.zip"
Content-Length: 1234567
```

#### GET /generations

List all generation requests for the authenticated user.

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 100) |
| status | string | - | Filter by status |

**Request**:
```bash
curl -X GET "https://flashfusion.vercel.app/api/generations?page=1&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "gen_abc123",
      "appName": "my-awesome-app",
      "status": "completed",
      "createdAt": "2025-11-22T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### Deployments

#### GET /deployments

List all deployments for the authenticated user.

**Authentication**: Required

**Request**:
```bash
curl -X GET https://flashfusion.vercel.app/api/deployments \
  -H "Authorization: Bearer <access_token>"
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "dep_xyz789",
      "generationId": "gen_abc123",
      "platform": "vercel",
      "url": "https://my-app.vercel.app",
      "status": "active",
      "lastVerified": "2025-11-22T14:30:00Z"
    }
  ]
}
```

#### GET /deployments/:id

Get details of a specific deployment.

**Authentication**: Required

**Request**:
```bash
curl -X GET https://flashfusion.vercel.app/api/deployments/dep_xyz789 \
  -H "Authorization: Bearer <access_token>"
```

**Response** (200 OK):
```json
{
  "data": {
    "id": "dep_xyz789",
    "generationId": "gen_abc123",
    "platform": "vercel",
    "url": "https://my-app.vercel.app",
    "status": "active",
    "metadata": {
      "buildId": "bld_123",
      "region": "iad1"
    },
    "lastVerified": "2025-11-22T14:30:00Z",
    "createdAt": "2025-11-22T14:00:00Z"
  }
}
```

---

## Webhooks

### Webhook Events

| Event | Description |
|-------|-------------|
| `generation.completed` | App generation completed |
| `generation.failed` | App generation failed |
| `deployment.created` | New deployment created |
| `deployment.status_changed` | Deployment status changed |

### Webhook Payload

```json
{
  "event": "generation.completed",
  "timestamp": "2025-11-22T14:30:00Z",
  "data": {
    "id": "gen_abc123",
    "appName": "my-awesome-app",
    "downloadUrl": "https://..."
  }
}
```

### Webhook Security

Verify webhook signatures using the `X-FlashFusion-Signature` header:

```typescript
const crypto = require('crypto');

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

## SDKs

### JavaScript/TypeScript

```typescript
import { FlashFusion } from '@flashfusion/sdk';

const client = new FlashFusion({
  accessToken: 'your-access-token'
});

const generation = await client.generate({
  appName: 'my-app',
  platform: 'web',
  framework: 'nextjs'
});

console.log(generation.id);
```

---

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for API changes.
