using System;
using System.Collections.Generic;

namespace MarocBillingSim.Api.Models
{
    public enum ProformaInvoiceStatus
    {
        Draft,
        Sent,
        Converted,
        Expired,
        Cancelled
    }
    
    public class ProformaInvoice : BaseEntity
    {
        public string ProformaNumber { get; set; }
        public DateTime Date { get; set; }
        public DateTime ExpiryDate { get; set; }
        public ProformaInvoiceStatus Status { get; set; }
        public decimal Subtotal { get; set; }
        public decimal VatAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
        public string Notes { get; set; }
        public string Terms { get; set; }
        public DateTime? ConvertedAt { get; set; }
        
        // Foreign keys
        public Guid CompanyId { get; set; }
        public Guid ClientId { get; set; }
        public Guid? ConvertedInvoiceId { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public Client Client { get; set; }
        public Invoice ConvertedInvoice { get; set; }
        public ICollection<InvoiceItem> Items { get; set; }
    }
} 