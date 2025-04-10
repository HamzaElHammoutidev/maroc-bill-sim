using System;
using System.Collections.Generic;
using MarocBillingSim.Api.Enums;

namespace MarocBillingSim.Api.Models
{
    public class Client : BaseEntity
    {
        public string Name { get; set; }
        public string Ice { get; set; } // Identifiant Commun de l'Entreprise (optional for some clients)
        public string If { get; set; } // Identifiant Fiscal
        public string Rc { get; set; } // Registre de Commerce
        public string Cnss { get; set; } // CNSS number (optional)
        public string Address { get; set; }
        public string City { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Website { get; set; }
        public string ContactName { get; set; }
        public string Category { get; set; } // VIP, regular, prospect, new
        public PaymentMethod? PreferredPaymentMethod { get; set; }
        public string PaymentTerms { get; set; } // Standard payment terms (30 days, 60 days, etc.)
        
        // Foreign keys
        public Guid CompanyId { get; set; }
        
        // Navigation properties
        public Company Company { get; set; }
        public ICollection<Contact> Contacts { get; set; }
        public ICollection<Invoice> Invoices { get; set; }
        public ICollection<Quote> Quotes { get; set; }
        public ICollection<CreditNote> CreditNotes { get; set; }
    }
} 