using System;

namespace MarocBillingSim.Api.Models
{
    public class InvoiceItem : BaseEntity
    {
        public string Description { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal VatRate { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
        
        // Foreign keys
        public Guid? InvoiceId { get; set; }
        public Guid? QuoteId { get; set; }
        public Guid? ProformaInvoiceId { get; set; }
        public Guid? CreditNoteId { get; set; }
        public Guid ProductId { get; set; }
        
        // Navigation properties
        public Invoice Invoice { get; set; }
        public Quote Quote { get; set; }
        public ProformaInvoice ProformaInvoice { get; set; }
        public CreditNote CreditNote { get; set; }
        public Product Product { get; set; }
    }
} 