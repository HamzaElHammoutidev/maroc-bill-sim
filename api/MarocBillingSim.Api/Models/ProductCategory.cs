using System;
using System.Collections.Generic;

namespace MarocBillingSim.Api.Models
{
    public class ProductCategory : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Foreign keys
        public Guid CompanyId { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public ICollection<Product> Products { get; set; }
    }
} 