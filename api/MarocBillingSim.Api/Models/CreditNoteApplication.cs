using System;
using MarocBillingSim.Api.Enums;

namespace MarocBillingSim.Api.Models
{
    public class CreditNoteApplication : BaseEntity
    {
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public bool IsRefund { get; set; }
        public PaymentMethod? RefundMethod { get; set; }
        public string RefundReference { get; set; }
        
        // Foreign keys
        public Guid CreditNoteId { get; set; }
        public Guid? TargetInvoiceId { get; set; }
        
        // Navigation properties
        public CreditNote CreditNote { get; set; }
        public Invoice TargetInvoice { get; set; }
    }
} 