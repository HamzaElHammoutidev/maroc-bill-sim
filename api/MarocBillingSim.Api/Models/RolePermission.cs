using System;
using MarocBillingSim.Api.Enums;

namespace MarocBillingSim.Api.Models
{
    public class RolePermission : BaseEntity
    {
        public UserRole Role { get; set; }
        public Guid PermissionId { get; set; }
        public AccessLevel AccessLevel { get; set; }
        
        // Navigation properties
        public Permission Permission { get; set; }
    }
} 