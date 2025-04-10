using System;
using MarocBillingSim.Api.Enums;

namespace MarocBillingSim.Api.Models
{
    public class StockMovement : BaseEntity
    {
        public StockMovementType Type { get; set; }
        public int Quantity { get; set; } // Positive for in, negative for out
        public string Reason { get; set; }
        public string ReferenceType { get; set; } // Invoice, Quote, CreditNote, etc.
        public Guid? ReferenceId { get; set; } // ID of the related document
        public int PreviousStock { get; set; }
        public int NewStock { get; set; }
        public DateTime Date { get; set; }
        
        // Foreign keys
        public Guid CompanyId { get; set; }
        public Guid ProductId { get; set; }
        public Guid LocationId { get; set; }
        public Guid CreatedById { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public Product Product { get; set; }
        public StockLocation Location { get; set; }
        public User CreatedBy { get; set; }
    }
} 