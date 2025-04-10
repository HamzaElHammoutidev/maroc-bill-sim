using System;
using MarocBillingSim.Api.Enums;

namespace MarocBillingSim.Api.Models
{
    public class ProductDiscount : BaseEntity
    {
        public string Name { get; set; }
        public DiscountType Type { get; set; } // Percentage or fixed amount
        public decimal Value { get; set; } // Percentage (0-100) or fixed amount
        public string ClientCategory { get; set; } // Optional: Apply only to specific client category
        public string Code { get; set; } // Optional: Promo code to apply the discount
        public DateTime? StartDate { get; set; } // Optional: Validity period start
        public DateTime? EndDate { get; set; } // Optional: Validity period end
        public bool IsActive { get; set; } = true;
        
        // Foreign keys
        public Guid ProductId { get; set; }
        public Guid? ClientId { get; set; } // Optional: Apply only to specific client
        
        // Navigation properties
        public Product Product { get; set; }
        public Client Client { get; set; }
    }
} 