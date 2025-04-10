using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MarocBillingSim.Api.Data;
using MarocBillingSim.Api.Enums;
using MarocBillingSim.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Text;

namespace MarocBillingSim.Api.Controllers
{
    /// <summary>
    /// Manages companies and their related resources
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CompaniesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CompaniesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // DTOs
        public class CompanyDto
        {
            public Guid Id { get; set; }
            public string Name { get; set; }
            public string Ice { get; set; }
            public string If { get; set; }
            public string Rc { get; set; }
            public string Cnss { get; set; }
            public string Address { get; set; }
            public string City { get; set; }
            public string Phone { get; set; }
            public string Email { get; set; }
            public string LogoUrl { get; set; }
            public string Website { get; set; }
            public string Rib { get; set; }
            public int UserCount { get; set; }
        }

        public class CreateCompanyRequest
        {
            public string Name { get; set; }
            public string Ice { get; set; }
            public string If { get; set; }
            public string Rc { get; set; }
            public string Cnss { get; set; }
            public string Address { get; set; }
            public string City { get; set; }
            public string Phone { get; set; }
            public string Email { get; set; }
            public string LogoUrl { get; set; }
            public string Website { get; set; }
            public string Rib { get; set; }
        }

        public class UpdateCompanyRequest
        {
            public string Name { get; set; }
            public string Ice { get; set; }
            public string If { get; set; }
            public string Rc { get; set; }
            public string Cnss { get; set; }
            public string Address { get; set; }
            public string City { get; set; }
            public string Phone { get; set; }
            public string Email { get; set; }
            public string LogoUrl { get; set; }
            public string Website { get; set; }
            public string Rib { get; set; }
        }

        // GET: api/Companies
        [HttpGet]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<IEnumerable<CompanyDto>>> GetCompanies()
        {
            var companies = await _context.Companies
                .Include(c => c.Users)
                .ToListAsync();

            return companies.Select(c => new CompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                Ice = c.Ice,
                If = c.If,
                Rc = c.Rc,
                Cnss = c.Cnss,
                Address = c.Address,
                City = c.City,
                Phone = c.Phone,
                Email = c.Email,
                LogoUrl = c.LogoUrl,
                Website = c.Website,
                Rib = c.Rib,
                UserCount = c.Users?.Count ?? 0
            }).ToList();
        }

        // GET: api/Companies/search
        [HttpGet("search")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<PagedResultDto<CompanyDto>>> SearchCompanies(
            [FromQuery] string searchTerm = "",
            [FromQuery] string city = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            // Ensure valid pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100; // Limit maximum page size

            // Build base query
            var query = _context.Companies
                .Include(c => c.Users)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(c => 
                    c.Name.ToLower().Contains(searchTerm) || 
                    c.Ice.ToLower().Contains(searchTerm) ||
                    c.Email.ToLower().Contains(searchTerm));
            }
            
            if (!string.IsNullOrEmpty(city))
            {
                query = query.Where(c => c.City != null && c.City.ToLower() == city.ToLower());
            }

            // Get total count for pagination
            var totalCount = await query.CountAsync();
            
            // Apply pagination
            var companies = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Map to DTOs
            var companyDtos = companies.Select(c => new CompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                Ice = c.Ice,
                If = c.If,
                Rc = c.Rc,
                Cnss = c.Cnss,
                Address = c.Address,
                City = c.City,
                Phone = c.Phone,
                Email = c.Email,
                LogoUrl = c.LogoUrl,
                Website = c.Website,
                Rib = c.Rib,
                UserCount = c.Users?.Count ?? 0
            }).ToList();

            // Return paged result
            return new PagedResultDto<CompanyDto>
            {
                Items = companyDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        // Pagination DTO
        public class PagedResultDto<T>
        {
            public List<T> Items { get; set; }
            public int TotalCount { get; set; }
            public int Page { get; set; }
            public int PageSize { get; set; }
            public int TotalPages { get; set; }
        }

        // GET: api/Companies/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CompanyDto>> GetCompany(Guid id)
        {
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Users can only see their own company unless they're super admin
            if (currentUserRole != UserRole.SuperAdmin.ToString() && 
                (!Guid.TryParse(companyIdClaim, out var userCompanyId) || userCompanyId != id))
            {
                return Forbid();
            }

            var company = await _context.Companies
                .Include(c => c.Users)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (company == null)
            {
                return NotFound();
            }

            return new CompanyDto
            {
                Id = company.Id,
                Name = company.Name,
                Ice = company.Ice,
                If = company.If,
                Rc = company.Rc,
                Cnss = company.Cnss,
                Address = company.Address,
                City = company.City,
                Phone = company.Phone,
                Email = company.Email,
                LogoUrl = company.LogoUrl,
                Website = company.Website,
                Rib = company.Rib,
                UserCount = company.Users?.Count ?? 0
            };
        }

        // POST: api/Companies
        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<CompanyDto>> CreateCompany(CreateCompanyRequest request)
        {
            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Ice))
            {
                return BadRequest("Company name and ICE are required");
            }

            // Check if ICE is already used
            if (await _context.Companies.AnyAsync(c => c.Ice == request.Ice))
            {
                return Conflict("ICE is already used by another company");
            }

            var company = new Company
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Ice = request.Ice,
                If = request.If,
                Rc = request.Rc,
                Cnss = request.Cnss,
                Address = request.Address,
                City = request.City,
                Phone = request.Phone,
                Email = request.Email,
                LogoUrl = request.LogoUrl,
                Website = request.Website,
                Rib = request.Rib
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCompany), 
                new { id = company.Id }, 
                new CompanyDto
                {
                    Id = company.Id,
                    Name = company.Name,
                    Ice = company.Ice,
                    If = company.If,
                    Rc = company.Rc,
                    Cnss = company.Cnss,
                    Address = company.Address,
                    City = company.City,
                    Phone = company.Phone,
                    Email = company.Email,
                    LogoUrl = company.LogoUrl,
                    Website = company.Website,
                    Rib = company.Rib,
                    UserCount = 0
                });
        }

        // PUT: api/Companies/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCompany(Guid id, UpdateCompanyRequest request)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null)
            {
                return NotFound();
            }

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Only super admin can update any company, admins can only update their own
            if (currentUserRole != UserRole.SuperAdmin.ToString())
            {
                if (!Guid.TryParse(companyIdClaim, out var userCompanyId) || userCompanyId != id)
                {
                    return Forbid();
                }

                // Regular admins cannot update company ICE
                if (company.Ice != request.Ice)
                {
                    return Forbid("Only super administrators can update ICE");
                }
            }
            else if (!string.IsNullOrEmpty(request.Ice) && request.Ice != company.Ice)
            {
                // Check if ICE is already used by another company
                if (await _context.Companies.AnyAsync(c => c.Ice == request.Ice && c.Id != id))
                {
                    return Conflict("ICE is already used by another company");
                }
                
                company.Ice = request.Ice;
            }

            // Update properties if provided
            if (!string.IsNullOrEmpty(request.Name))
            {
                company.Name = request.Name;
            }

            if (!string.IsNullOrEmpty(request.If))
            {
                company.If = request.If;
            }

            if (!string.IsNullOrEmpty(request.Rc))
            {
                company.Rc = request.Rc;
            }

            if (!string.IsNullOrEmpty(request.Cnss))
            {
                company.Cnss = request.Cnss;
            }

            if (request.Address != null)
            {
                company.Address = request.Address;
            }

            if (request.City != null)
            {
                company.City = request.City;
            }

            if (request.Phone != null)
            {
                company.Phone = request.Phone;
            }

            if (request.Email != null)
            {
                company.Email = request.Email;
            }

            if (request.LogoUrl != null)
            {
                company.LogoUrl = request.LogoUrl;
            }

            if (request.Website != null)
            {
                company.Website = request.Website;
            }

            if (request.Rib != null)
            {
                company.Rib = request.Rib;
            }

            _context.Entry(company).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Companies/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> DeleteCompany(Guid id)
        {
            var company = await _context.Companies
                .Include(c => c.Users)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (company == null)
            {
                return NotFound();
            }

            // Check if company has users
            if (company.Users != null && company.Users.Any())
            {
                return BadRequest("Cannot delete company with associated users. Remove all users first.");
            }

            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Companies/{id}/statistics
        [HttpGet("{id}/statistics")]
        public async Task<ActionResult<CompanyStatisticsDto>> GetCompanyStatistics(Guid id)
        {
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Users can only see statistics for their own company unless they're super admin
            if (currentUserRole != UserRole.SuperAdmin.ToString() && 
                (!Guid.TryParse(companyIdClaim, out var userCompanyId) || userCompanyId != id))
            {
                return Forbid();
            }

            var company = await _context.Companies
                .Include(c => c.Users)
                .Include(c => c.Clients)
                .Include(c => c.Products)
                .Include(c => c.Invoices)
                .Include(c => c.Quotes)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (company == null)
            {
                return NotFound();
            }

            // Calculate additional statistics
            int paidInvoicesCount = 0;
            int unpaidInvoicesCount = 0;
            decimal totalInvoicedAmount = 0;
            decimal totalPaidAmount = 0;

            if (company.Invoices != null)
            {
                foreach (var invoice in company.Invoices)
                {
                    if (invoice.Status == InvoiceStatus.Paid)
                    {
                        paidInvoicesCount++;
                        totalPaidAmount += invoice.Total;
                    }
                    else
                    {
                        unpaidInvoicesCount++;
                    }
                    totalInvoicedAmount += invoice.Total;
                }
            }

            return new CompanyStatisticsDto
            {
                CompanyId = company.Id,
                CompanyName = company.Name,
                UserCount = company.Users?.Count ?? 0,
                ClientCount = company.Clients?.Count ?? 0,
                ProductCount = company.Products?.Count ?? 0,
                InvoiceCount = company.Invoices?.Count ?? 0,
                QuoteCount = company.Quotes?.Count ?? 0,
                PaidInvoicesCount = paidInvoicesCount,
                UnpaidInvoicesCount = unpaidInvoicesCount,
                TotalInvoicedAmount = totalInvoicedAmount,
                TotalPaidAmount = totalPaidAmount
            };
        }

        public class CompanyStatisticsDto
        {
            public Guid CompanyId { get; set; }
            public string CompanyName { get; set; }
            public int UserCount { get; set; }
            public int ClientCount { get; set; }
            public int ProductCount { get; set; }
            public int InvoiceCount { get; set; }
            public int QuoteCount { get; set; }
            public int PaidInvoicesCount { get; set; }
            public int UnpaidInvoicesCount { get; set; }
            public decimal TotalInvoicedAmount { get; set; }
            public decimal TotalPaidAmount { get; set; }
        }

        // POST: api/Companies/{id}/logo
        [HttpPost("{id}/logo")]
        public async Task<ActionResult> UploadLogo(Guid id, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file was uploaded");
            }

            var company = await _context.Companies.FindAsync(id);
            if (company == null)
            {
                return NotFound();
            }

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Only super admin can update any company, admins can only update their own
            if (currentUserRole != UserRole.SuperAdmin.ToString())
            {
                if (!Guid.TryParse(companyIdClaim, out var userCompanyId) || userCompanyId != id)
                {
                    return Forbid();
                }
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest("Invalid file type. Only JPG, PNG, and GIF files are allowed.");
            }

            // Validate file size (max 2MB)
            if (file.Length > 2 * 1024 * 1024)
            {
                return BadRequest("File size exceeds the limit of 2MB.");
            }

            try
            {
                // Generate a unique filename
                var fileName = $"{company.Id}_{DateTime.UtcNow.Ticks}{fileExtension}";
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "logos");
                
                // Ensure directory exists
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }
                
                var filePath = Path.Combine(uploadsFolder, fileName);
                
                // Save the file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                
                // Update the company logo URL in the database
                var logoUrl = $"/uploads/logos/{fileName}";
                company.LogoUrl = logoUrl;
                
                _context.Entry(company).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                
                return Ok(new { logoUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/Companies/{id}/users
        [HttpGet("{id}/users")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetCompanyUsers(
            Guid id,
            [FromQuery] string searchTerm = "",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Users can only see users of their own company unless they're super admin
            if (currentUserRole != UserRole.SuperAdmin.ToString() && 
                (!Guid.TryParse(companyIdClaim, out var userCompanyId) || userCompanyId != id))
            {
                return Forbid();
            }

            // Check if company exists
            var companyExists = await _context.Companies.AnyAsync(c => c.Id == id);
            if (!companyExists)
            {
                return NotFound("Company not found");
            }

            // Ensure valid pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            // Build query
            var query = _context.Users
                .Where(u => u.CompanyId == id)
                .AsQueryable();

            // Apply search filter if provided
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(u => 
                    u.Name.ToLower().Contains(searchTerm) || 
                    u.Email.ToLower().Contains(searchTerm));
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var users = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Map to DTOs
            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                Active = u.Active,
                CompanyId = u.CompanyId
            }).ToList();

            // Return paged result
            return Ok(new PagedResultDto<UserDto>
            {
                Items = userDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        // GET: api/Companies/{id}/clients
        [HttpGet("{id}/clients")]
        public async Task<ActionResult<IEnumerable<ClientDto>>> GetCompanyClients(
            Guid id,
            [FromQuery] string searchTerm = "",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Users can only see clients of their own company unless they're super admin
            if (currentUserRole != UserRole.SuperAdmin.ToString() && 
                (!Guid.TryParse(companyIdClaim, out var userCompanyId) || userCompanyId != id))
            {
                return Forbid();
            }

            // Check if company exists
            var companyExists = await _context.Companies.AnyAsync(c => c.Id == id);
            if (!companyExists)
            {
                return NotFound("Company not found");
            }

            // Ensure valid pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            // Build query
            var query = _context.Clients
                .Where(c => c.CompanyId == id)
                .AsQueryable();

            // Apply search filter if provided
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(c => 
                    c.Name.ToLower().Contains(searchTerm) || 
                    c.Email.ToLower().Contains(searchTerm));
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var clients = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Map to DTOs
            var clientDtos = clients.Select(c => new ClientDto
            {
                Id = c.Id,
                Name = c.Name,
                Ice = c.Ice,
                Email = c.Email,
                Phone = c.Phone,
                Address = c.Address,
                City = c.City
            }).ToList();

            // Return paged result
            return Ok(new PagedResultDto<ClientDto>
            {
                Items = clientDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        // Client DTO
        public class ClientDto
        {
            public Guid Id { get; set; }
            public string Name { get; set; }
            public string Ice { get; set; }
            public string Email { get; set; }
            public string Phone { get; set; }
            public string Address { get; set; }
            public string City { get; set; }
        }

        // GET: api/Companies/{id}/products
        [HttpGet("{id}/products")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetCompanyProducts(
            Guid id,
            [FromQuery] string searchTerm = "",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Users can only see products of their own company unless they're super admin
            if (currentUserRole != UserRole.SuperAdmin.ToString() && 
                (!Guid.TryParse(companyIdClaim, out var userCompanyId) || userCompanyId != id))
            {
                return Forbid();
            }

            // Check if company exists
            var companyExists = await _context.Companies.AnyAsync(c => c.Id == id);
            if (!companyExists)
            {
                return NotFound("Company not found");
            }

            // Ensure valid pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            // Build query
            var query = _context.Products
                .Where(p => p.CompanyId == id)
                .AsQueryable();

            // Apply search filter if provided
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(p => 
                    p.Name.ToLower().Contains(searchTerm) || 
                    p.Reference.ToLower().Contains(searchTerm) ||
                    p.Description.ToLower().Contains(searchTerm));
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Map to DTOs
            var productDtos = products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Reference = p.Reference,
                Description = p.Description,
                Price = p.Price,
                VatRate = p.VatRate
            }).ToList();

            // Return paged result
            return Ok(new PagedResultDto<ProductDto>
            {
                Items = productDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        // Product DTO
        public class ProductDto
        {
            public Guid Id { get; set; }
            public string Name { get; set; }
            public string Reference { get; set; }
            public string Description { get; set; }
            public decimal Price { get; set; }
            public decimal VatRate { get; set; }
        }

        // GET: api/Companies/{id}/invoices
        [HttpGet("{id}/invoices")]
        public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetCompanyInvoices(
            Guid id,
            [FromQuery] string searchTerm = "",
            [FromQuery] InvoiceStatus? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Users can only see invoices of their own company unless they're super admin
            if (currentUserRole != UserRole.SuperAdmin.ToString() && 
                (!Guid.TryParse(companyIdClaim, out var userCompanyId) || userCompanyId != id))
            {
                return Forbid();
            }

            // Check if company exists
            var companyExists = await _context.Companies.AnyAsync(c => c.Id == id);
            if (!companyExists)
            {
                return NotFound("Company not found");
            }

            // Ensure valid pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            // Build query
            var query = _context.Invoices
                .Include(i => i.Client)
                .Where(i => i.CompanyId == id)
                .AsQueryable();

            // Apply search filter if provided
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(i => 
                    i.InvoiceNumber.ToLower().Contains(searchTerm) || 
                    i.Client.Name.ToLower().Contains(searchTerm));
            }

            // Filter by status if provided
            if (status.HasValue)
            {
                query = query.Where(i => i.Status == status.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var invoices = await query
                .OrderByDescending(i => i.Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Map to DTOs
            var invoiceDtos = invoices.Select(i => new InvoiceDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                ClientName = i.Client.Name,
                Date = i.Date,
                DueDate = i.DueDate,
                Status = i.Status,
                Total = i.Total,
                PaidAmount = i.PaidAmount ?? 0
            }).ToList();

            // Return paged result
            return Ok(new PagedResultDto<InvoiceDto>
            {
                Items = invoiceDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        // Invoice DTO
        public class InvoiceDto
        {
            public Guid Id { get; set; }
            public string InvoiceNumber { get; set; }
            public string ClientName { get; set; }
            public DateTime Date { get; set; }
            public DateTime DueDate { get; set; }
            public InvoiceStatus Status { get; set; }
            public decimal Total { get; set; }
            public decimal PaidAmount { get; set; }
        }

        // User DTO for company context
        public class UserDto
        {
            public Guid Id { get; set; }
            public string Name { get; set; }
            public string Email { get; set; }
            public UserRole Role { get; set; }
            public bool Active { get; set; }
            public Guid? CompanyId { get; set; }
        }

        // GET: api/Companies/export
        [HttpGet("export")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult> ExportCompanies()
        {
            // Get all companies
            var companies = await _context.Companies
                .Include(c => c.Users)
                .ToListAsync();
            
            // Create CSV string
            var csvBuilder = new StringBuilder();
            
            // Add header
            csvBuilder.AppendLine("Id,Name,ICE,IF,RC,CNSS,Address,City,Phone,Email,Website,RIB,UserCount");
            
            // Add data rows
            foreach (var company in companies)
            {
                csvBuilder.AppendLine(string.Join(",", 
                    CsvEscape(company.Id.ToString()),
                    CsvEscape(company.Name),
                    CsvEscape(company.Ice),
                    CsvEscape(company.If),
                    CsvEscape(company.Rc),
                    CsvEscape(company.Cnss),
                    CsvEscape(company.Address),
                    CsvEscape(company.City),
                    CsvEscape(company.Phone),
                    CsvEscape(company.Email),
                    CsvEscape(company.Website),
                    CsvEscape(company.Rib),
                    (company.Users?.Count ?? 0).ToString()
                ));
            }
            
            // Return as file
            var bytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            return File(bytes, "text/csv", $"companies_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
        }
        
        // POST: api/Companies/import
        [HttpPost("import")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult> ImportCompanies(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file was uploaded");
            }
            
            // Check file extension
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (fileExtension != ".csv")
            {
                return BadRequest("Only CSV files are supported");
            }
            
            var result = new ImportResult
            {
                TotalRecords = 0,
                SuccessCount = 0,
                FailedCount = 0,
                Errors = new List<string>()
            };
            
            using (var reader = new StreamReader(file.OpenReadStream()))
            {
                // Skip header row
                await reader.ReadLineAsync();
                
                string line;
                int lineNumber = 1;
                
                while ((line = await reader.ReadLineAsync()) != null)
                {
                    lineNumber++;
                    result.TotalRecords++;
                    
                    try
                    {
                        // Split CSV line
                        var values = ParseCsvLine(line);
                        
                        // Need at least name and ICE
                        if (values.Length < 2 || string.IsNullOrEmpty(values[0]) || string.IsNullOrEmpty(values[1]))
                        {
                            result.FailedCount++;
                            result.Errors.Add($"Line {lineNumber}: Missing required fields (Name and ICE)");
                            continue;
                        }
                        
                        var name = values[0];
                        var ice = values[1];
                        
                        // Check if ICE already exists
                        if (await _context.Companies.AnyAsync(c => c.Ice == ice))
                        {
                            result.FailedCount++;
                            result.Errors.Add($"Line {lineNumber}: Company with ICE '{ice}' already exists");
                            continue;
                        }
                        
                        // Create new company
                        var company = new Company
                        {
                            Id = Guid.NewGuid(),
                            Name = name,
                            Ice = ice,
                            If = values.Length > 2 ? values[2] : null,
                            Rc = values.Length > 3 ? values[3] : null,
                            Cnss = values.Length > 4 ? values[4] : null,
                            Address = values.Length > 5 ? values[5] : null,
                            City = values.Length > 6 ? values[6] : null,
                            Phone = values.Length > 7 ? values[7] : null,
                            Email = values.Length > 8 ? values[8] : null,
                            Website = values.Length > 9 ? values[9] : null,
                            Rib = values.Length > 10 ? values[10] : null
                        };
                        
                        _context.Companies.Add(company);
                        result.SuccessCount++;
                    }
                    catch (Exception ex)
                    {
                        result.FailedCount++;
                        result.Errors.Add($"Line {lineNumber}: {ex.Message}");
                    }
                }
            }
            
            if (result.SuccessCount > 0)
            {
                await _context.SaveChangesAsync();
            }
            
            return Ok(result);
        }
        
        private string CsvEscape(string value)
        {
            if (string.IsNullOrEmpty(value))
                return "";
                
            bool needsQuotes = value.Contains(",") || value.Contains("\"") || value.Contains("\r") || value.Contains("\n");
            
            if (needsQuotes)
            {
                // Replace double quotes with two double quotes
                return $"\"{value.Replace("\"", "\"\"")}\"";
            }
            
            return value;
        }
        
        private string[] ParseCsvLine(string line)
        {
            List<string> result = new List<string>();
            bool inQuotes = false;
            int startIndex = 0;
            
            for (int i = 0; i < line.Length; i++)
            {
                if (line[i] == '\"')
                {
                    inQuotes = !inQuotes;
                }
                else if (line[i] == ',' && !inQuotes)
                {
                    result.Add(line.Substring(startIndex, i - startIndex).Trim(' ', '\"'));
                    startIndex = i + 1;
                }
            }
            
            // Add last field
            result.Add(line.Substring(startIndex).Trim(' ', '\"'));
            
            return result.ToArray();
        }
        
        // Import result DTO
        public class ImportResult
        {
            public int TotalRecords { get; set; }
            public int SuccessCount { get; set; }
            public int FailedCount { get; set; }
            public List<string> Errors { get; set; }
        }

        // GET: api/Companies/analytics
        [HttpGet("analytics")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<CompanyAnalyticsDto>> GetCompanyAnalytics()
        {
            // Global statistics
            var totalCompanies = await _context.Companies.CountAsync();
            var activeUsersCount = await _context.Users.Where(u => u.Active).CountAsync();
            
            // Company counts by city
            var companiesByCity = await _context.Companies
                .Where(c => !string.IsNullOrEmpty(c.City))
                .GroupBy(c => c.City)
                .Select(g => new CityStatDto 
                { 
                    City = g.Key, 
                    CompanyCount = g.Count() 
                })
                .OrderByDescending(x => x.CompanyCount)
                .Take(10)
                .ToListAsync();
                
            // Invoice statistics
            var paidInvoicesCount = await _context.Invoices.CountAsync(i => i.Status == InvoiceStatus.Paid);
            var unpaidInvoicesCount = await _context.Invoices.CountAsync(i => i.Status != InvoiceStatus.Paid);
            var totalInvoicedAmount = await _context.Invoices.SumAsync(i => i.Total);
            
            // User statistics
            var usersByRole = await _context.Users
                .GroupBy(u => u.Role)
                .Select(g => new RoleStatDto 
                { 
                    Role = g.Key.ToString(), 
                    UserCount = g.Count() 
                })
                .ToListAsync();
                
            // Companies with most users
            var topCompaniesByUsers = await _context.Companies
                .Include(c => c.Users)
                .OrderByDescending(c => c.Users.Count)
                .Take(5)
                .Select(c => new CompanyUserStatDto
                {
                    CompanyId = c.Id,
                    CompanyName = c.Name,
                    UserCount = c.Users.Count
                })
                .ToListAsync();
                
            // Companies with most invoices
            var topCompaniesByInvoices = await _context.Companies
                .Include(c => c.Invoices)
                .OrderByDescending(c => c.Invoices.Count)
                .Take(5)
                .Select(c => new CompanyInvoiceStatDto
                {
                    CompanyId = c.Id,
                    CompanyName = c.Name,
                    InvoiceCount = c.Invoices.Count,
                    TotalAmount = c.Invoices.Sum(i => i.Total)
                })
                .ToListAsync();
            
            return new CompanyAnalyticsDto
            {
                TotalCompanies = totalCompanies,
                ActiveUsersCount = activeUsersCount,
                PaidInvoicesCount = paidInvoicesCount,
                UnpaidInvoicesCount = unpaidInvoicesCount,
                TotalInvoicedAmount = totalInvoicedAmount,
                CompaniesByCity = companiesByCity,
                UsersByRole = usersByRole,
                TopCompaniesByUsers = topCompaniesByUsers,
                TopCompaniesByInvoices = topCompaniesByInvoices
            };
        }
        
        // Analytics DTOs
        public class CompanyAnalyticsDto
        {
            public int TotalCompanies { get; set; }
            public int ActiveUsersCount { get; set; }
            public int PaidInvoicesCount { get; set; }
            public int UnpaidInvoicesCount { get; set; }
            public decimal TotalInvoicedAmount { get; set; }
            public List<CityStatDto> CompaniesByCity { get; set; }
            public List<RoleStatDto> UsersByRole { get; set; }
            public List<CompanyUserStatDto> TopCompaniesByUsers { get; set; }
            public List<CompanyInvoiceStatDto> TopCompaniesByInvoices { get; set; }
        }
        
        public class CityStatDto
        {
            public string City { get; set; }
            public int CompanyCount { get; set; }
        }
        
        public class RoleStatDto
        {
            public string Role { get; set; }
            public int UserCount { get; set; }
        }
        
        public class CompanyUserStatDto
        {
            public Guid CompanyId { get; set; }
            public string CompanyName { get; set; }
            public int UserCount { get; set; }
        }
        
        public class CompanyInvoiceStatDto
        {
            public Guid CompanyId { get; set; }
            public string CompanyName { get; set; }
            public int InvoiceCount { get; set; }
            public decimal TotalAmount { get; set; }
        }
    }
} 