using System;
using System.Collections.Generic;

namespace MarocBillingSim.Api.Models
{
    public class Company : BaseEntity
    {
        public string Name { get; set; }
        public string Ice { get; set; } // Identifiant Commun de l'Entreprise
        public string If { get; set; } // Identifiant Fiscal
        public string Rc { get; set; } // Registre de Commerce
        public string Cnss { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string LogoUrl { get; set; }
        public string Website { get; set; }
        public string Rib { get; set; } // Bank account info
        
        // Navigation properties
        public ICollection<User> Users { get; set; }
        public ICollection<Client> Clients { get; set; }
        public ICollection<Product> Products { get; set; }
        public ICollection<Invoice> Invoices { get; set; }
        public ICollection<Quote> Quotes { get; set; }
    }
} 