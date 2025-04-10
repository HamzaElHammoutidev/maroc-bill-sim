using Microsoft.EntityFrameworkCore;

namespace MarocBillingSim.Api.Data
{
    public static class DatabaseInitializer
    {
        public static void Initialize(WebApplication app)
        {
            // Create a new scope to get scoped services
            using var scope = app.Services.CreateScope();
            var services = scope.ServiceProvider;
            
            try
            {
                var dbContext = services.GetRequiredService<ApplicationDbContext>();
                
                // Apply any pending migrations
                dbContext.Database.Migrate();
                
                // Seed any required data here if needed
                
                app.Logger.LogInformation("Database initialization completed successfully.");
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();
                logger.LogError(ex, "An error occurred while initializing the database.");
            }
        }
    }
} 