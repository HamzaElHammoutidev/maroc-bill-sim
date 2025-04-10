using System;
using System.Collections.Generic;
using MarocBillingSim.Api.Enums;

namespace MarocBillingSim.Api.Models
{
    public class Invoice : BaseEntity
    {
        public string InvoiceNumber { get; set; }
        public DateTime Date { get; set; }
        public DateTime DueDate { get; set; }
        public InvoiceStatus Status { get; set; }
        public decimal Subtotal { get; set; }
        public decimal VatAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
        public decimal? PaidAmount { get; set; }
        public DateTime? LastPaymentDate { get; set; }
        public string Notes { get; set; }
        public string Terms { get; set; }
        
        // Fiscal stamp information
        public bool HasFiscalStamp { get; set; }
        public decimal? FiscalStampAmount { get; set; }
        public string FiscalStampId { get; set; }
        
        // Invoice validation and locking
        public bool IsValidated { get; set; }
        public DateTime? ValidatedAt { get; set; }
        public bool IsLocked { get; set; }
        
        // Email tracking
        public DateTime? SentAt { get; set; }
        
        // Deposit information
        public bool IsDeposit { get; set; }
        public decimal? DepositAmount { get; set; }
        public decimal? DepositPercentage { get; set; }
        
        // Credit note tracking
        public bool HasCreditNotes { get; set; }
        public decimal? CreditNoteTotal { get; set; }
        
        // Document archiving
        public int? ArchiveVersion { get; set; }
        public string ArchiveUrl { get; set; }
        public DateTime? ArchivedAt { get; set; }
        
        // Foreign keys
        public Guid CompanyId { get; set; }
        public Guid ClientId { get; set; }
        public Guid? QuoteId { get; set; }
        public Guid? ValidatedById { get; set; }
        public Guid? SentById { get; set; }
        public Guid? DepositForInvoiceId { get; set; }
        public Guid? DepositInvoiceId { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public Client Client { get; set; }
        public Quote Quote { get; set; }
        public User ValidatedBy { get; set; }
        public User SentBy { get; set; }
        public Invoice DepositForInvoice { get; set; }
        public Invoice DepositInvoice { get; set; }
        public ICollection<InvoiceItem> Items { get; set; }
        public ICollection<Payment> Payments { get; set; }
        public ICollection<CreditNote> CreditNotes { get; set; }
        public ICollection<EmailHistory> EmailHistory { get; set; }
    }
} 