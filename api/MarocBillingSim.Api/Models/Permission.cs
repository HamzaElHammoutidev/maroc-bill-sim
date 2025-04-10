using System;
using System.Collections.Generic;

namespace MarocBillingSim.Api.Models
{
    public class Permission : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Code { get; set; } // Unique identifier
        
        // Navigation properties
        public ICollection<RolePermission> RolePermissions { get; set; }
        public ICollection<UserPermission> UserPermissions { get; set; }
    }
} 