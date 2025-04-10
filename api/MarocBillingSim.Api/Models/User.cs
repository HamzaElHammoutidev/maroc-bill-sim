using System;
using System.Collections.Generic;
using MarocBillingSim.Api.Enums;

namespace MarocBillingSim.Api.Models
{
    public class User : BaseEntity
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public bool Active { get; set; } = true;
        
        // Foreign keys
        public Guid? CompanyId { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public ICollection<UserPermission> UserPermissions { get; set; }
    }
} 