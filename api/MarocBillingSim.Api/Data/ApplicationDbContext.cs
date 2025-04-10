using System;
using Microsoft.EntityFrameworkCore;
using MarocBillingSim.Api.Models;
using MarocBillingSim.Api.Enums;

namespace MarocBillingSim.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        // DbSets for entities
        public DbSet<User> Users { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<ProductDiscount> ProductDiscounts { get; set; }
        public DbSet<StockLocation> StockLocations { get; set; }
        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<ProformaInvoice> ProformaInvoices { get; set; }
        public DbSet<Quote> Quotes { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<CreditNote> CreditNotes { get; set; }
        public DbSet<CreditNoteApplication> CreditNoteApplications { get; set; }
        public DbSet<EmailHistory> EmailHistories { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<NotificationPreference> NotificationPreferences { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure entity relationships and constraints
            
            // User
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
                
            // Company
            modelBuilder.Entity<Company>()
                .HasIndex(c => c.Ice)
                .IsUnique();
                
            // Client
            modelBuilder.Entity<Client>()
                .HasOne(c => c.Company)
                .WithMany(c => c.Clients)
                .HasForeignKey(c => c.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Contact
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.Client)
                .WithMany(c => c.Contacts)
                .HasForeignKey(c => c.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Product
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Company)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<Product>()
                .HasOne(p => p.ProductCategory)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
                
            // Invoice
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Company)
                .WithMany(c => c.Invoices)
                .HasForeignKey(i => i.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Client)
                .WithMany(c => c.Invoices)
                .HasForeignKey(i => i.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Invoice>()
                .HasIndex(i => i.InvoiceNumber)
                .IsUnique();
                
            // Quote
            modelBuilder.Entity<Quote>()
                .HasOne(q => q.Company)
                .WithMany(c => c.Quotes)
                .HasForeignKey(q => q.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<Quote>()
                .HasOne(q => q.Client)
                .WithMany(c => c.Quotes)
                .HasForeignKey(q => q.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Quote>()
                .HasIndex(q => q.QuoteNumber)
                .IsUnique();
                
            // Self-referencing relationships for Quote versions
            modelBuilder.Entity<Quote>()
                .HasOne(q => q.PreviousVersion)
                .WithMany()
                .HasForeignKey(q => q.PreviousVersionId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Quote>()
                .HasOne(q => q.OriginalQuote)
                .WithMany(q => q.Versions)
                .HasForeignKey(q => q.OriginalQuoteId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Self-referencing relationships for Invoice deposit invoices
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.DepositForInvoice)
                .WithMany()
                .HasForeignKey(i => i.DepositForInvoiceId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.DepositInvoice)
                .WithMany()
                .HasForeignKey(i => i.DepositInvoiceId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // InvoiceItem
            modelBuilder.Entity<InvoiceItem>()
                .HasOne(ii => ii.Invoice)
                .WithMany(i => i.Items)
                .HasForeignKey(ii => ii.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<InvoiceItem>()
                .HasOne(ii => ii.Quote)
                .WithMany(q => q.Items)
                .HasForeignKey(ii => ii.QuoteId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<InvoiceItem>()
                .HasOne(ii => ii.ProformaInvoice)
                .WithMany(pi => pi.Items)
                .HasForeignKey(ii => ii.ProformaInvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<InvoiceItem>()
                .HasOne(ii => ii.CreditNote)
                .WithMany(cn => cn.Items)
                .HasForeignKey(ii => ii.CreditNoteId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // NotificationPreference
            modelBuilder.Entity<NotificationPreference>()
                .HasOne(np => np.User)
                .WithMany()
                .HasForeignKey(np => np.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<NotificationPreference>()
                .HasIndex(np => new { np.UserId, np.Type, np.Channel })
                .IsUnique();
        }
    }
} 