using System;
using MarocBillingSim.Api.Enums;
using System.Text.Json;

namespace MarocBillingSim.Api.Models
{
    public class Payment : BaseEntity
    {
        public string TransactionId { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public PaymentMethod Method { get; set; }
        public string Reference { get; set; }
        public string Notes { get; set; }
        public PaymentStatus Status { get; set; }
        public string AdditionalFields { get; set; } // Stored as JSON
        
        // Foreign keys
        public Guid CompanyId { get; set; }
        public Guid InvoiceId { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public Invoice Invoice { get; set; }
    }
} 