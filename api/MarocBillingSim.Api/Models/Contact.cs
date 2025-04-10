using System;

namespace MarocBillingSim.Api.Models
{
    public class Contact : BaseEntity
    {
        public string Name { get; set; }
        public string Role { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        
        // Foreign keys
        public Guid ClientId { get; set; }
        
        // Navigation properties
        public Client Client { get; set; }
    }
} 