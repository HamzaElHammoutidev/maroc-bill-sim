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
    /// Manages user notification preferences
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // DTOs
        public class NotificationPreferenceDto
        {
            public Guid Id { get; set; }
            public string Type { get; set; }
            public string Channel { get; set; }
            public bool Enabled { get; set; }
            public Guid UserId { get; set; }
        }

        public class CreateNotificationPreferenceRequest
        {
            public NotificationType Type { get; set; }
            public NotificationChannel Channel { get; set; }
            public bool Enabled { get; set; } = true;
            public Guid? UserId { get; set; } // Only used by admins
        }

        public class UpdateNotificationPreferenceRequest
        {
            public bool Enabled { get; set; }
        }

        // GET: api/Notifications/preferences
        [HttpGet("preferences")]
        public async Task<ActionResult<IEnumerable<NotificationPreferenceDto>>> GetMyNotificationPreferences()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var preferences = await _context.Set<NotificationPreference>()
                .Where(p => p.UserId == userGuid)
                .ToListAsync();

            return preferences.Select(p => new NotificationPreferenceDto
            {
                Id = p.Id,
                Type = p.Type.ToString(),
                Channel = p.Channel.ToString(),
                Enabled = p.Enabled,
                UserId = p.UserId
            }).ToList();
        }

        // GET: api/Notifications/preferences/{id}
        [HttpGet("preferences/{id}")]
        public async Task<ActionResult<NotificationPreferenceDto>> GetNotificationPreference(Guid id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var preference = await _context.Set<NotificationPreference>().FindAsync(id);

            if (preference == null)
            {
                return NotFound();
            }

            // Users can only view their own preferences unless they're admin
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (preference.UserId != userGuid && 
                currentUserRole != UserRole.SuperAdmin.ToString() &&
                currentUserRole != UserRole.Admin.ToString())
            {
                return Forbid();
            }

            return new NotificationPreferenceDto
            {
                Id = preference.Id,
                Type = preference.Type.ToString(),
                Channel = preference.Channel.ToString(),
                Enabled = preference.Enabled,
                UserId = preference.UserId
            };
        }

        // POST: api/Notifications/preferences
        [HttpPost("preferences")]
        public async Task<ActionResult<NotificationPreferenceDto>> CreateNotificationPreference(CreateNotificationPreferenceRequest request)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var targetUserId = userGuid;

            // If admin is creating for another user
            if (request.UserId.HasValue && request.UserId.Value != userGuid)
            {
                var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                if (currentUserRole != UserRole.SuperAdmin.ToString() &&
                    currentUserRole != UserRole.Admin.ToString())
                {
                    return Forbid();
                }

                // Check if target user exists
                var targetUser = await _context.Users.FindAsync(request.UserId.Value);
                if (targetUser == null)
                {
                    return NotFound("Target user not found");
                }

                // Admin can only set preferences for users in their company
                if (currentUserRole == UserRole.Admin.ToString())
                {
                    var companyIdClaim = User.FindFirst("CompanyId")?.Value;
                    if (Guid.TryParse(companyIdClaim, out var adminCompanyId) &&
                        targetUser.CompanyId != adminCompanyId)
                    {
                        return Forbid();
                    }
                }

                targetUserId = request.UserId.Value;
            }

            // Check if preference already exists
            var existingPreference = await _context.Set<NotificationPreference>()
                .FirstOrDefaultAsync(p => 
                    p.UserId == targetUserId && 
                    p.Type == request.Type && 
                    p.Channel == request.Channel);

            if (existingPreference != null)
            {
                return Conflict("Notification preference already exists");
            }

            var preference = new NotificationPreference
            {
                Id = Guid.NewGuid(),
                Type = request.Type,
                Channel = request.Channel,
                Enabled = request.Enabled,
                UserId = targetUserId
            };

            _context.Set<NotificationPreference>().Add(preference);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetNotificationPreference),
                new { id = preference.Id },
                new NotificationPreferenceDto
                {
                    Id = preference.Id,
                    Type = preference.Type.ToString(),
                    Channel = preference.Channel.ToString(),
                    Enabled = preference.Enabled,
                    UserId = preference.UserId
                });
        }

        // PUT: api/Notifications/preferences/{id}
        [HttpPut("preferences/{id}")]
        public async Task<IActionResult> UpdateNotificationPreference(Guid id, UpdateNotificationPreferenceRequest request)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var preference = await _context.Set<NotificationPreference>().FindAsync(id);
            if (preference == null)
            {
                return NotFound();
            }

            // Users can only update their own preferences unless they're admin
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (preference.UserId != userGuid)
            {
                if (currentUserRole != UserRole.SuperAdmin.ToString() &&
                    currentUserRole != UserRole.Admin.ToString())
                {
                    return Forbid();
                }

                // Admin can only update preferences for users in their company
                if (currentUserRole == UserRole.Admin.ToString())
                {
                    var targetUser = await _context.Users.FindAsync(preference.UserId);
                    if (targetUser == null)
                    {
                        return NotFound("User not found");
                    }

                    var companyIdClaim = User.FindFirst("CompanyId")?.Value;
                    if (Guid.TryParse(companyIdClaim, out var adminCompanyId) &&
                        targetUser.CompanyId != adminCompanyId)
                    {
                        return Forbid();
                    }
                }
            }

            preference.Enabled = request.Enabled;

            _context.Entry(preference).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Notifications/preferences/{id}
        [HttpDelete("preferences/{id}")]
        public async Task<IActionResult> DeleteNotificationPreference(Guid id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var preference = await _context.Set<NotificationPreference>().FindAsync(id);
            if (preference == null)
            {
                return NotFound();
            }

            // Users can only delete their own preferences unless they're admin
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (preference.UserId != userGuid)
            {
                if (currentUserRole != UserRole.SuperAdmin.ToString() &&
                    currentUserRole != UserRole.Admin.ToString())
                {
                    return Forbid();
                }

                // Admin can only delete preferences for users in their company
                if (currentUserRole == UserRole.Admin.ToString())
                {
                    var targetUser = await _context.Users.FindAsync(preference.UserId);
                    if (targetUser == null)
                    {
                        return NotFound("User not found");
                    }

                    var companyIdClaim = User.FindFirst("CompanyId")?.Value;
                    if (Guid.TryParse(companyIdClaim, out var adminCompanyId) &&
                        targetUser.CompanyId != adminCompanyId)
                    {
                        return Forbid();
                    }
                }
            }

            _context.Set<NotificationPreference>().Remove(preference);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Notifications/preferences/user/{userId}
        [HttpGet("preferences/user/{userId}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<IEnumerable<NotificationPreferenceDto>>> GetUserNotificationPreferences(Guid userId)
        {
            var currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            
            // Check if target user exists
            var targetUser = await _context.Users.FindAsync(userId);
            if (targetUser == null)
            {
                return NotFound("User not found");
            }

            // Admin can only view preferences for users in their company
            if (currentUserRole == UserRole.Admin.ToString())
            {
                var companyIdClaim = User.FindFirst("CompanyId")?.Value;
                if (Guid.TryParse(companyIdClaim, out var adminCompanyId) &&
                    targetUser.CompanyId != adminCompanyId)
                {
                    return Forbid();
                }
            }

            var preferences = await _context.Set<NotificationPreference>()
                .Where(p => p.UserId == userId)
                .ToListAsync();

            return preferences.Select(p => new NotificationPreferenceDto
            {
                Id = p.Id,
                Type = p.Type.ToString(),
                Channel = p.Channel.ToString(),
                Enabled = p.Enabled,
                UserId = p.UserId
            }).ToList();
        }
    }
} 