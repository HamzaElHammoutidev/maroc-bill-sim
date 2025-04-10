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

namespace MarocBillingSim.Api.Controllers
{
    /// <summary>
    /// Manages user accounts and permissions
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // DTOs
        public class UserDto
        {
            public Guid Id { get; set; }
            public string Name { get; set; }
            public string Email { get; set; }
            public UserRole Role { get; set; }
            public bool Active { get; set; }
            public Guid? CompanyId { get; set; }
            public string CompanyName { get; set; }
        }

        public class CreateUserRequest
        {
            public string Name { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
            public UserRole Role { get; set; }
            public Guid? CompanyId { get; set; }
        }

        public class UpdateUserRequest
        {
            public string Name { get; set; }
            public string Email { get; set; }
            public UserRole? Role { get; set; }
            public bool? Active { get; set; }
            public Guid? CompanyId { get; set; }
        }

        public class UpdatePasswordRequest
        {
            public string CurrentPassword { get; set; }
            public string NewPassword { get; set; }
        }

        // GET: api/Users
        [HttpGet]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Build query based on user role
            var query = _context.Users.Include(u => u.Company).AsQueryable();

            // If not super admin, limit to users in the same company
            if (currentUserRole != UserRole.SuperAdmin.ToString() && Guid.TryParse(companyIdClaim, out var companyId))
            {
                query = query.Where(u => u.CompanyId == companyId);
            }

            var users = await query.ToListAsync();

            return users.Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                Active = u.Active,
                CompanyId = u.CompanyId,
                CompanyName = u.Company?.Name
            }).ToList();
        }

        // GET: api/Users/search
        /// <summary>
        /// Search and retrieve users with pagination and filtering
        /// </summary>
        /// <param name="searchTerm">Optional text to search in user name or email</param>
        /// <param name="role">Optional role filter</param>
        /// <param name="active">Optional active status filter</param>
        /// <param name="companyId">Optional company ID filter (only for SuperAdmin)</param>
        /// <param name="page">Page number (default: 1)</param>
        /// <param name="pageSize">Items per page (default: 10, max: 100)</param>
        /// <returns>Paginated list of users matching the search criteria</returns>
        /// <response code="200">Returns the filtered users</response>
        /// <response code="403">If the user doesn't have permission</response>
        [HttpGet("search")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<PagedResultDto<UserDto>>> SearchUsers(
            [FromQuery] string searchTerm = "", 
            [FromQuery] UserRole? role = null, 
            [FromQuery] bool? active = null,
            [FromQuery] Guid? companyId = null,
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            // Ensure valid pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100; // Limit maximum page size

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Build base query
            var query = _context.Users.Include(u => u.Company).AsQueryable();

            // If not super admin, limit to users in the same company
            if (currentUserRole != UserRole.SuperAdmin.ToString() && Guid.TryParse(companyIdClaim, out var adminCompanyId))
            {
                query = query.Where(u => u.CompanyId == adminCompanyId);
                
                // Override companyId filter if provided but user is not SuperAdmin
                companyId = adminCompanyId;
            }

            // Apply filters
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(u => 
                    u.Name.ToLower().Contains(searchTerm) || 
                    u.Email.ToLower().Contains(searchTerm));
            }
            
            if (role.HasValue)
            {
                query = query.Where(u => u.Role == role.Value);
            }
            
            if (active.HasValue)
            {
                query = query.Where(u => u.Active == active.Value);
            }
            
            if (companyId.HasValue && currentUserRole == UserRole.SuperAdmin.ToString())
            {
                query = query.Where(u => u.CompanyId == companyId.Value);
            }

            // Get total count for pagination
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
                CompanyId = u.CompanyId,
                CompanyName = u.Company?.Name
            }).ToList();

            // Return paged result
            return new PagedResultDto<UserDto>
            {
                Items = userDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(Guid id)
        {
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Build query
            var user = await _context.Users
                .Include(u => u.Company)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            // Security check: users can only see themselves unless they're admin/superadmin
            if (currentUserRole != UserRole.SuperAdmin.ToString() && 
                currentUserRole != UserRole.Admin.ToString() && 
                currentUserId != id.ToString())
            {
                return Forbid();
            }

            // If admin, they can only see users in their company
            if (currentUserRole == UserRole.Admin.ToString() && 
                Guid.TryParse(companyIdClaim, out var adminCompanyId) &&
                user.CompanyId != adminCompanyId)
            {
                return Forbid();
            }

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                Active = user.Active,
                CompanyId = user.CompanyId,
                CompanyName = user.Company?.Name
            };
        }

        // POST: api/Users
        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserRequest request)
        {
            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Name, email, and password are required");
            }

            // Validate email format
            if (!IsValidEmail(request.Email))
            {
                return BadRequest("Invalid email format");
            }

            // Check if email is already used
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return Conflict("Email is already used by another user");
            }

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Company validation
            if (request.CompanyId.HasValue)
            {
                var company = await _context.Companies.FindAsync(request.CompanyId.Value);
                if (company == null)
                {
                    return BadRequest("Invalid company ID");
                }

                // Admin can only create users for their own company
                if (currentUserRole == UserRole.Admin.ToString() && 
                    Guid.TryParse(companyIdClaim, out var adminCompanyId) &&
                    adminCompanyId != request.CompanyId.Value)
                {
                    return Forbid();
                }
            }
            else if (currentUserRole == UserRole.Admin.ToString() && Guid.TryParse(companyIdClaim, out var adminCompanyId))
            {
                // Admins must assign their own company to new users
                request.CompanyId = adminCompanyId;
            }

            // Role validation
            if (currentUserRole == UserRole.Admin.ToString() && 
                (request.Role == UserRole.SuperAdmin || request.Role == UserRole.Admin))
            {
                return Forbid("Admin users cannot create SuperAdmin or Admin users");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email,
                PasswordHash = request.Password, // In a real app, this would be hashed
                Role = request.Role,
                CompanyId = request.CompanyId,
                Active = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetUser), 
                new { id = user.Id }, 
                new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role,
                    Active = user.Active,
                    CompanyId = user.CompanyId
                });
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> UpdateUser(Guid id, UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Security checks
            if (currentUserRole == UserRole.Admin.ToString())
            {
                // Admins can only update users in their own company
                if (Guid.TryParse(companyIdClaim, out var adminCompanyId) && user.CompanyId != adminCompanyId)
                {
                    return Forbid();
                }

                // Admins cannot update SuperAdmin or other Admin users
                if (user.Role == UserRole.SuperAdmin || (user.Role == UserRole.Admin && user.Id.ToString() != currentUserId))
                {
                    return Forbid();
                }

                // Admins cannot change user to SuperAdmin or Admin
                if (request.Role.HasValue && (request.Role == UserRole.SuperAdmin || 
                    (request.Role == UserRole.Admin && user.Id.ToString() != currentUserId)))
                {
                    return Forbid("Admin users cannot grant SuperAdmin or Admin roles");
                }

                // Admins cannot change company ID
                if (request.CompanyId.HasValue && request.CompanyId != user.CompanyId)
                {
                    return Forbid("Admin users cannot change company assignment");
                }
            }

            // Validate email if provided
            if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
            {
                if (!IsValidEmail(request.Email))
                {
                    return BadRequest("Invalid email format");
                }

                // Check if email is already used
                if (await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != id))
                {
                    return Conflict("Email is already used by another user");
                }
                
                user.Email = request.Email;
            }

            // Update properties if provided
            if (!string.IsNullOrEmpty(request.Name))
            {
                user.Name = request.Name;
            }

            if (request.Role.HasValue)
            {
                user.Role = request.Role.Value;
            }

            if (request.Active.HasValue)
            {
                user.Active = request.Active.Value;
            }

            if (request.CompanyId.HasValue)
            {
                var company = await _context.Companies.FindAsync(request.CompanyId.Value);
                if (company == null)
                {
                    return BadRequest("Invalid company ID");
                }
                user.CompanyId = request.CompanyId.Value;
            }

            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Users/5/password
        [HttpPatch("{id}/password")]
        public async Task<IActionResult> UpdatePassword(Guid id, UpdatePasswordRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            // Users can only change their own password unless they're an admin
            if (id.ToString() != currentUserId && 
                currentUserRole != UserRole.SuperAdmin.ToString() && 
                currentUserRole != UserRole.Admin.ToString())
            {
                return Forbid();
            }

            // If it's the user updating their own password, validate current password
            if (id.ToString() == currentUserId)
            {
                if (user.PasswordHash != request.CurrentPassword)
                {
                    return BadRequest("Current password is incorrect");
                }
            }

            // Update password
            user.PasswordHash = request.NewPassword; // In a real app, this would be hashed
            
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Cannot delete yourself
            if (id.ToString() == currentUserId)
            {
                return BadRequest("You cannot delete your own account");
            }

            // Security checks for admins
            if (currentUserRole == UserRole.Admin.ToString())
            {
                // Admins can only delete users in their own company
                if (Guid.TryParse(companyIdClaim, out var adminCompanyId) && user.CompanyId != adminCompanyId)
                {
                    return Forbid();
                }

                // Admins cannot delete SuperAdmin or other Admin users
                if (user.Role == UserRole.SuperAdmin || user.Role == UserRole.Admin)
                {
                    return Forbid();
                }
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
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

        // GET: api/Users/{id}/permissions
        [HttpGet("{id}/permissions")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<IEnumerable<PermissionDto>>> GetUserPermissions(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Security check: Admin can only see permissions for users in their company
            if (currentUserRole == UserRole.Admin.ToString() && 
                Guid.TryParse(companyIdClaim, out var adminCompanyId) &&
                user.CompanyId != adminCompanyId)
            {
                return Forbid();
            }

            var permissions = await _context.UserPermissions
                .Include(up => up.Permission)
                .Where(up => up.UserId == id)
                .ToListAsync();

            return permissions.Select(p => new PermissionDto
            {
                Id = p.PermissionId,
                Name = p.Permission.Name,
                Description = p.Permission.Description
            }).ToList();
        }

        // POST: api/Users/{id}/permissions
        [HttpPost("{id}/permissions")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult> AddUserPermission(Guid id, [FromBody] AddPermissionRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var permission = await _context.Permissions.FindAsync(request.PermissionId);
            if (permission == null)
            {
                return NotFound("Permission not found");
            }

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Security check: Admin can only modify users in their company
            if (currentUserRole == UserRole.Admin.ToString() && 
                Guid.TryParse(companyIdClaim, out var adminCompanyId) &&
                user.CompanyId != adminCompanyId)
            {
                return Forbid();
            }

            // Check if permission already exists
            var existingPermission = await _context.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == id && up.PermissionId == request.PermissionId);
                
            if (existingPermission != null)
            {
                return Conflict("User already has this permission");
            }

            var userPermission = new UserPermission
            {
                UserId = id,
                PermissionId = request.PermissionId
            };

            _context.UserPermissions.Add(userPermission);
            await _context.SaveChangesAsync();

            return Ok(new PermissionDto
            {
                Id = permission.Id,
                Name = permission.Name,
                Description = permission.Description
            });
        }

        // DELETE: api/Users/{id}/permissions/{permissionId}
        [HttpDelete("{id}/permissions/{permissionId}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult> RemoveUserPermission(Guid id, Guid permissionId)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Security check: Admin can only modify users in their company
            if (currentUserRole == UserRole.Admin.ToString() && 
                Guid.TryParse(companyIdClaim, out var adminCompanyId) &&
                user.CompanyId != adminCompanyId)
            {
                return Forbid();
            }

            var userPermission = await _context.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == id && up.PermissionId == permissionId);
                
            if (userPermission == null)
            {
                return NotFound("Permission not assigned to user");
            }

            _context.UserPermissions.Remove(userPermission);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Permission DTOs
        public class PermissionDto
        {
            public Guid Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
        }

        public class AddPermissionRequest
        {
            public Guid PermissionId { get; set; }
        }

        // PATCH: api/Users/bulk-status
        [HttpPatch("bulk-status")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult> BulkUpdateStatus([FromBody] BulkStatusUpdateRequest request)
        {
            if (request.UserIds == null || !request.UserIds.Any())
            {
                return BadRequest("User IDs are required");
            }

            if (!request.Active.HasValue)
            {
                return BadRequest("Active status is required");
            }

            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var companyIdClaim = User.FindFirst("CompanyId")?.Value;

            // Get users to update
            var usersToUpdate = await _context.Users
                .Where(u => request.UserIds.Contains(u.Id))
                .ToListAsync();

            if (!usersToUpdate.Any())
            {
                return NotFound("No users found with the specified IDs");
            }

            var processedIds = new List<Guid>();
            var skippedIds = new List<Guid>();

            foreach (var user in usersToUpdate)
            {
                bool canModify = true;

                // Security checks
                if (currentUserRole == UserRole.Admin.ToString())
                {
                    // Admins can only modify users in their own company
                    if (Guid.TryParse(companyIdClaim, out var adminCompanyId) && user.CompanyId != adminCompanyId)
                    {
                        skippedIds.Add(user.Id);
                        canModify = false;
                        continue;
                    }

                    // Admins cannot modify SuperAdmin or other Admin users
                    if (user.Role == UserRole.SuperAdmin || 
                        (user.Role == UserRole.Admin && user.Id.ToString() != currentUserId))
                    {
                        skippedIds.Add(user.Id);
                        canModify = false;
                        continue;
                    }
                }

                // Cannot modify yourself
                if (user.Id.ToString() == currentUserId)
                {
                    skippedIds.Add(user.Id);
                    canModify = false;
                    continue;
                }

                if (canModify)
                {
                    user.Active = request.Active.Value;
                    processedIds.Add(user.Id);
                }
            }

            if (processedIds.Any())
            {
                await _context.SaveChangesAsync();
            }

            return Ok(new 
            {
                ProcessedCount = processedIds.Count,
                ProcessedIds = processedIds,
                SkippedCount = skippedIds.Count,
                SkippedIds = skippedIds
            });
        }

        public class BulkStatusUpdateRequest
        {
            public List<Guid> UserIds { get; set; }
            public bool? Active { get; set; }
        }
    }
} 