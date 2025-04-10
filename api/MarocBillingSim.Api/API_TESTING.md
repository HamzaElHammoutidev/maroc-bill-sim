# API Testing Guide for MarocBillingSim API

This document provides instructions for testing the MarocBillingSim API endpoints.

## Prerequisites

1. [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) installed
2. [PostgreSQL](https://www.postgresql.org/download/) installed and running
3. VS Code with [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) for API testing

## Running the API

From the solution root directory, run:

```bash
dotnet run --project api/MarocBillingSim.Api/MarocBillingSim.Api.csproj
```

The API will be available at:
- HTTPS: https://localhost:7241
- HTTP: http://localhost:5097
- Swagger UI: https://localhost:7241/ (root path)

## Authentication

The API uses JWT Bearer authentication. To test protected endpoints:

1. First call the login endpoint to get a token
2. Copy the token from the response
3. Use the token in subsequent requests by adding it to the Authorization header:
   `Authorization: Bearer your-token-here`

## Using the Test Files

We've provided HTTP test files for each controller. You can use these with VS Code's REST Client extension:

### Auth API Tests (test-auth-api.http)

The Auth API provides endpoints for:
- User authentication (login)
- Getting the current user
- Creating test users
- Testing protected endpoints

Before using any other API, initialize test data by calling the `/api/auth/test` endpoint.

### Users API Tests (test-users-api.http)

The Users API provides endpoints for:
- Getting all users (admin/superadmin only)
- Getting a specific user
- Creating users (admin/superadmin only)
- Updating users (admin/superadmin only)
- Updating passwords
- Deleting users (admin/superadmin only)

### Companies API Tests (test-companies-api.http)

The Companies API provides endpoints for:
- Getting all companies (superadmin only)
- Getting a specific company
- Creating companies (superadmin only)
- Updating companies
- Deleting companies (superadmin only)

## Testing Flow

For a complete test of the API, follow this workflow:

1. Start the API server
2. Call `/api/auth/test` to initialize test data
3. Log in with one of the test users (e.g., superadmin@example.com with password123)
4. Copy the token and replace the `@token` variable in the test files
5. Test each endpoint in sequence

## Role-Based Access

The API implements role-based access control:

- **SuperAdmin**: Full access to all endpoints and data
- **Admin**: Full access to their own company and its users (except other admins)
- **Comptable**: Limited access based on their company
- **Commercial**: Limited access based on their company

Make sure to test with different user roles to verify access controls. 