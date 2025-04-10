using System;
using System.Collections.Generic;

namespace MarocBillingSim.Api.Models
{
    public class Product : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public decimal VatRate { get; set; } // 0, 7, 10, 14, 20
        public string Unit { get; set; } // piece, hour, kg, etc.
        public bool IsService { get; set; }
        public string Reference { get; set; } // Internal reference code
        public string Barcode { get; set; } // Barcode for physical products
        public string Category { get; set; } // Product category
        public int? MinQuantity { get; set; } // Minimum order quantity
        
        // Stock management fields
        public bool ManageStock { get; set; }
        public int? CurrentStock { get; set; }
        public int? MinStock { get; set; }
        public int? AlertStock { get; set; }
        public Guid? LocationId { get; set; }
        
        // Foreign keys
        public Guid CompanyId { get; set; }
        public Guid? CategoryId { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public ProductCategory ProductCategory { get; set; }
        public StockLocation StockLocation { get; set; }
        public ICollection<ProductDiscount> Discounts { get; set; }
        public ICollection<InvoiceItem> InvoiceItems { get; set; }
        public ICollection<StockMovement> StockMovements { get; set; }
    }
} 