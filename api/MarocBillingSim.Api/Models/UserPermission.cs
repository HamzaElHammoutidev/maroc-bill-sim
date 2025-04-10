using System;
using MarocBillingSim.Api.Enums;

namespace MarocBillingSim.Api.Models
{
    public class UserPermission : BaseEntity
    {
        public Guid UserId { get; set; }
        public Guid PermissionId { get; set; }
        public AccessLevel AccessLevel { get; set; }
        
        // Navigation properties
        public User User { get; set; }
        public Permission Permission { get; set; }
    }
} 