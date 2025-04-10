using System;
using System.Text.Json;

namespace MarocBillingSim.Api.Models
{
    public class AuditLog : BaseEntity
    {
        public string Action { get; set; }
        public string EntityType { get; set; }
        public Guid? EntityId { get; set; }
        public string Details { get; set; } // Stored as JSON
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
        
        // Foreign keys
        public Guid? CompanyId { get; set; }
        public Guid? UserId { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public User User { get; set; }
        
        // Helper method for JSON details
        public T GetDetails<T>() where T : class
        {
            return string.IsNullOrEmpty(Details)
                ? null
                : JsonSerializer.Deserialize<T>(Details);
        }
        
        public void SetDetails<T>(T details) where T : class
        {
            Details = JsonSerializer.Serialize(details);
        }
    }
} 