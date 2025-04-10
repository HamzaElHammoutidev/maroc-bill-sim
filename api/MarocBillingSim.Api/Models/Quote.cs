using System;
using System.Collections.Generic;
using MarocBillingSim.Api.Enums;

namespace MarocBillingSim.Api.Models
{
    public class Quote : BaseEntity
    {
        public string QuoteNumber { get; set; }
        public DateTime Date { get; set; }
        public DateTime ExpiryDate { get; set; }
        public QuoteStatus Status { get; set; }
        public decimal Subtotal { get; set; }
        public decimal VatAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
        public string Notes { get; set; }
        public string Terms { get; set; }
        public bool NeedsValidation { get; set; }
        public DateTime? ValidatedAt { get; set; }
        public int? VersionNumber { get; set; }
        public bool IsLatestVersion { get; set; } = true;
        
        // Foreign keys
        public Guid CompanyId { get; set; }
        public Guid ClientId { get; set; }
        public Guid? ValidatedById { get; set; }
        public Guid? PreviousVersionId { get; set; }
        public Guid? OriginalQuoteId { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public Client Client { get; set; }
        public User ValidatedBy { get; set; }
        public Quote PreviousVersion { get; set; }
        public Quote OriginalQuote { get; set; }
        public ICollection<Quote> Versions { get; set; }
        public ICollection<InvoiceItem> Items { get; set; }
        public ICollection<Invoice> Invoices { get; set; }
    }
} 