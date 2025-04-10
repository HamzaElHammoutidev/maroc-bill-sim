using System;
using MarocBillingSim.Api.Enums;

namespace MarocBillingSim.Api.Models
{
    public class NotificationPreference : BaseEntity
    {
        public NotificationType Type { get; set; }
        public NotificationChannel Channel { get; set; }
        public bool Enabled { get; set; } = true;
        
        // Foreign keys
        public Guid UserId { get; set; }
        
        // Navigation properties
        public User User { get; set; }
    }
} 