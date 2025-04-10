using System;
using System.Collections.Generic;
using MarocBillingSim.Api.Enums;

namespace MarocBillingSim.Api.Models
{
    public class CreditNote : BaseEntity
    {
        public string CreditNoteNumber { get; set; }
        public DateTime Date { get; set; }
        public CreditNoteStatus Status { get; set; }
        public CreditNoteReason Reason { get; set; }
        public string ReasonDescription { get; set; }
        public decimal Subtotal { get; set; }
        public decimal VatAmount { get; set; }
        public decimal Total { get; set; }
        public string Notes { get; set; }
        public bool AffectsStock { get; set; }
        public bool StockAdjusted { get; set; }
        public decimal AppliedAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public bool IsFullyApplied { get; set; }
        public int? ArchiveVersion { get; set; }
        public string ArchiveUrl { get; set; }
        public DateTime? ArchivedAt { get; set; }
        
        // Foreign keys
        public Guid CompanyId { get; set; }
        public Guid ClientId { get; set; }
        public Guid InvoiceId { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public Client Client { get; set; }
        public Invoice Invoice { get; set; }
        public ICollection<InvoiceItem> Items { get; set; }
        public ICollection<CreditNoteApplication> Applications { get; set; }
    }
} 