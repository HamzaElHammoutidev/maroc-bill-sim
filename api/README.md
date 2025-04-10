# MarocBillingSim API

This is the backend API for the MarocBillingSim application. It is built with .NET Core, Entity Framework Core, and PostgreSQL.

## Prerequisites

- .NET 8.0 SDK
- PostgreSQL

## Getting Started

### Database Setup

1. Install PostgreSQL if you haven't already.
2. Create a database named `maroc_billing_sim`:
   ```sql
   CREATE DATABASE maroc_billing_sim;
   ```
3. Update the connection string in `appsettings.json` if needed:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Database=maroc_billing_sim;Username=postgres;Password=postgres"
   }
   ```

### Running the API

1. Navigate to the project directory:
   ```
   cd MarocBillingSim.Api
   ```

2. Restore dependencies:
   ```
   dotnet restore
   ```

3. Apply database migrations:
   ```
   dotnet ef database update
   ```

4. Run the API:
   ```
   dotnet run
   ```

The API will be available at https://localhost:5001 and http://localhost:5000.

## API Documentation

Swagger documentation is available at `/swagger` when the API is running.

## Project Structure

- **Controllers/**: API endpoints
- **Data/**: Database context and repositories
- **Models/**: Entity models
- **DTOs/**: Data transfer objects
- **Services/**: Business logic
- **Enums/**: Enumeration types

## Database Schema

The database schema includes the following main entities:

- Users
- Companies
- Clients
- Products
- Invoices
- Quotes
- Payments
- Credit Notes
- Stock Management

See the full entity relationships in the `Data/ApplicationDbContext.cs` file.

## Development

### Creating a Migration

```
dotnet ef migrations add MigrationName
```

### Updating the Database

```
dotnet ef database update
```

### Running Tests

```
dotnet test
``` 