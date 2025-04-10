using System;
using System.Collections.Generic;

namespace MarocBillingSim.Api.Models
{
    public class StockLocation : BaseEntity
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public bool IsDefault { get; set; }
        
        // Foreign keys
        public Guid CompanyId { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public ICollection<Product> Products { get; set; }
        public ICollection<StockMovement> StockMovements { get; set; }
    }
} 