using System;
using System.Collections.Generic;
using System.Text.Json;

namespace MarocBillingSim.Api.Models
{
    public enum EmailStatus
    {
        Sent,
        Failed,
        Opened,
        Responded
    }
    
    public class EmailHistory : BaseEntity
    {
        public string EntityType { get; set; } // invoice, quote, etc.
        public Guid EntityId { get; set; }
        public DateTime SentAt { get; set; }
        public string Recipients { get; set; } // Stored as JSON array
        public string Cc { get; set; } // Stored as JSON array
        public string Subject { get; set; }
        public string Message { get; set; }
        public EmailStatus Status { get; set; }
        public DateTime? ResponseDate { get; set; }
        public string ResponseNotes { get; set; }
        
        // Foreign keys
        public Guid CompanyId { get; set; }
        public Guid SentById { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public User SentBy { get; set; }
        
        // Helper methods for JSON fields
        public List<string> GetRecipients()
        {
            return string.IsNullOrEmpty(Recipients)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(Recipients);
        }
        
        public void SetRecipients(List<string> recipients)
        {
            Recipients = JsonSerializer.Serialize(recipients);
        }
        
        public List<string> GetCc()
        {
            return string.IsNullOrEmpty(Cc)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(Cc);
        }
        
        public void SetCc(List<string> cc)
        {
            Cc = JsonSerializer.Serialize(cc);
        }
    }
} 