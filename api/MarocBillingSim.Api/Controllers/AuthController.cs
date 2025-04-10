using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using MarocBillingSim.Api.Data;
using MarocBillingSim.Api.Enums;
using MarocBillingSim.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace MarocBillingSim.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ApiExplorerSettings(GroupName = "v1")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public class LoginRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        public class RegisterRequest
        {
            public string Name { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
            public UserRole Role { get; set; }
            public Guid? CompanyId { get; set; }
        }

        public class ChangePasswordRequest
        {
            public string CurrentPassword { get; set; }
            public string NewPassword { get; set; }
        }

        public class ForgotPasswordRequest
        {
            public string Email { get; set; }
        }

        public class ResetPasswordRequest
        {
            public string Email { get; set; }
            public string Token { get; set; }
            public string NewPassword { get; set; }
        }

        public class RefreshTokenRequest
        {
            public string RefreshToken { get; set; }
        }

        public class VerifyEmailRequest
        {
            public string Email { get; set; }
            public string Token { get; set; }
        }

        public class ResendVerificationRequest
        {
            public string Email { get; set; }
        }

        public class LoginResponse
        {
            public string Token { get; set; }
            public string RefreshToken { get; set; }
            public string Id { get; set; }
            public string Name { get; set; }
            public string Email { get; set; }
            public UserRole Role { get; set; }
            public Guid? CompanyId { get; set; }
        }

        /// <summary>
        /// Authenticates a user and returns a JWT token
        /// </summary>
        /// <param name="request">Login credentials</param>
        /// <returns>User information with JWT token</returns>
        /// <response code="200">Returns the user with a valid JWT token</response>
        /// <response code="401">If the credentials are invalid</response>
        /// <response code="400">If the request is invalid</response>
        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Email and password are required");
            }

            var user = await _context.Users
                .Include(u => u.Company)
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.Active);

            if (user == null)
            {
                return Unauthorized("Invalid email or password");
            }

            // In a real app, you should use a proper password hasher
            // For example: _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password)
            if (user.PasswordHash != request.Password)
            {
                return Unauthorized("Invalid email or password");
            }

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken(user);

            return new LoginResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                Id = user.Id.ToString(),
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CompanyId = user.CompanyId
            };
        }

        /// <summary>
        /// Register a new user
        /// </summary>
        /// <param name="request">Registration information</param>
        /// <returns>Created user information</returns>
        /// <response code="201">Returns the newly created user</response>
        /// <response code="400">If the request is invalid or email is already in use</response>
        [HttpPost("register")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<LoginResponse>> Register(RegisterRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.Name))
            {
                return BadRequest("Name, email, and password are required");
            }

            // Check if user with this email already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Email is already in use");
            }

            // Check company exists if provided
            if (request.CompanyId.HasValue)
            {
                var company = await _context.Companies.FindAsync(request.CompanyId.Value);
                if (company == null)
                {
                    return BadRequest("Company does not exist");
                }
            }

            // In a real app, you should hash the password
            // For example: var passwordHash = _passwordHasher.HashPassword(null, request.Password);
            var passwordHash = request.Password;

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = request.Role,
                CompanyId = request.CompanyId,
                Active = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken(user);

            return CreatedAtAction(nameof(GetCurrentUser), new { id = user.Id }, new LoginResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                Id = user.Id.ToString(),
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CompanyId = user.CompanyId
            });
        }

        /// <summary>
        /// Gets the current authenticated user
        /// </summary>
        /// <returns>Current user information</returns>
        /// <response code="200">Returns the current user</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="404">If the user is not found</response>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<LoginResponse>> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var user = await _context.Users
                .Include(u => u.Company)
                .FirstOrDefaultAsync(u => u.Id == userGuid && u.Active);

            if (user == null)
            {
                return NotFound();
            }

            return new LoginResponse
            {
                Id = user.Id.ToString(),
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CompanyId = user.CompanyId
            };
        }

        /// <summary>
        /// Refresh JWT token using a refresh token
        /// </summary>
        /// <param name="request">Refresh token request</param>
        /// <returns>New JWT token and refresh token</returns>
        /// <response code="200">Returns new tokens</response>
        /// <response code="400">If the request is invalid</response>
        /// <response code="401">If the refresh token is invalid</response>
        [HttpPost("refresh-token")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<LoginResponse>> RefreshToken(RefreshTokenRequest request)
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
            {
                return BadRequest("Refresh token is required");
            }

            // In a real app, you would validate the refresh token against a database
            // For this simple example, we'll just extract the user id from the token
            var userId = ValidateRefreshToken(request.RefreshToken);
            if (userId == null)
            {
                return Unauthorized("Invalid refresh token");
            }

            var user = await _context.Users
                .Include(u => u.Company)
                .FirstOrDefaultAsync(u => u.Id == userId && u.Active);

            if (user == null)
            {
                return Unauthorized("Invalid refresh token");
            }

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken(user);

            return new LoginResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                Id = user.Id.ToString(),
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CompanyId = user.CompanyId
            };
        }

        /// <summary>
        /// Logout the current user
        /// </summary>
        /// <returns>Success message</returns>
        /// <response code="200">Logout successful</response>
        /// <response code="401">If the user is not authenticated</response>
        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public ActionResult Logout()
        {
            // In a more complete implementation, you would invalidate the refresh token in the database
            return Ok(new { message = "Logout successful" });
        }

        /// <summary>
        /// Change user's password
        /// </summary>
        /// <param name="request">Current and new password</param>
        /// <returns>Success message</returns>
        /// <response code="200">Password changed successfully</response>
        /// <response code="400">If the request is invalid</response>
        /// <response code="401">If the current password is incorrect</response>
        [HttpPost("change-password")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult> ChangePassword(ChangePasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.CurrentPassword) || string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest("Current password and new password are required");
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userGuid);
            if (user == null)
            {
                return Unauthorized();
            }

            // In a real app, you should use a proper password hasher for verification
            if (user.PasswordHash != request.CurrentPassword)
            {
                return Unauthorized("Current password is incorrect");
            }

            // In a real app, you should hash the new password
            user.PasswordHash = request.NewPassword;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Password changed successfully" });
        }

        /// <summary>
        /// Request a password reset email
        /// </summary>
        /// <param name="request">Email address</param>
        /// <returns>Success message</returns>
        /// <response code="200">Password reset email sent</response>
        /// <response code="400">If the request is invalid</response>
        [HttpPost("forgot-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest("Email is required");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Active);
            
            // Even if we don't find the user, return OK to prevent email enumeration attacks
            if (user != null)
            {
                // Generate password reset token
                var resetToken = GeneratePasswordResetToken(user);
                
                // In a real app, you would send an email with a link containing the token
                // For example: _emailService.SendPasswordResetEmail(user.Email, resetToken);
                
                // Log the token for testing purposes
                Console.WriteLine($"Password reset token for {user.Email}: {resetToken}");
            }
            
            return Ok(new { message = "If your email exists in our system, you will receive a password reset link" });
        }

        /// <summary>
        /// Reset password using token received via email
        /// </summary>
        /// <param name="request">Email, token, and new password</param>
        /// <returns>Success message</returns>
        /// <response code="200">Password reset successful</response>
        /// <response code="400">If the request is invalid or token is expired</response>
        [HttpPost("reset-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> ResetPassword(ResetPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest("Email, token, and new password are required");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Active);
            if (user == null)
            {
                // Return a generic error to prevent enumeration attacks
                return BadRequest("Invalid or expired token");
            }

            // In a real app, you would validate the token against a stored token
            // For example: bool isValidToken = _tokenService.ValidatePasswordResetToken(user.Id, request.Token);
            bool isValidToken = true; // Mock validation for now

            if (!isValidToken)
            {
                return BadRequest("Invalid or expired token");
            }

            // In a real app, you would hash the new password
            user.PasswordHash = request.NewPassword;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Password has been reset successfully" });
        }

        /// <summary>
        /// Verify email address using token
        /// </summary>
        /// <param name="request">Email and verification token</param>
        /// <returns>Success message</returns>
        /// <response code="200">Email verified successfully</response>
        /// <response code="400">If the request is invalid or token is expired</response>
        [HttpPost("verify-email")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> VerifyEmail(VerifyEmailRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Token))
            {
                return BadRequest("Email and token are required");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                // Return a generic error to prevent enumeration attacks
                return BadRequest("Invalid or expired token");
            }

            // In a real app, you would validate the token against a stored verification token
            // For example: bool isValidToken = _tokenService.ValidateEmailVerificationToken(user.Id, request.Token);
            bool isValidToken = true; // Mock validation for now

            if (!isValidToken)
            {
                return BadRequest("Invalid or expired token");
            }

            // Mark the user's email as verified
            // In a real app, you might have a property like: user.EmailVerified = true;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Email verified successfully" });
        }

        /// <summary>
        /// Resend email verification link
        /// </summary>
        /// <param name="request">Email address</param>
        /// <returns>Success message</returns>
        /// <response code="200">Verification email sent</response>
        /// <response code="400">If the request is invalid</response>
        [HttpPost("resend-verification")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> ResendVerification(ResendVerificationRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest("Email is required");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Active);
            
            // Even if we don't find the user, return OK to prevent email enumeration attacks
            if (user != null)
            {
                // Generate verification token
                var verificationToken = GenerateEmailVerificationToken(user);
                
                // In a real app, you would send an email with a link containing the token
                // For example: _emailService.SendVerificationEmail(user.Email, verificationToken);
                
                // Log the token for testing purposes
                Console.WriteLine($"Email verification token for {user.Email}: {verificationToken}");
            }
            
            return Ok(new { message = "If your email exists in our system, you will receive a verification link" });
        }

        /// <summary>
        /// Test endpoint to initialize and verify authentication system
        /// </summary>
        /// <returns>Test users and authentication status</returns>
        /// <response code="200">Returns test users info or confirmation of creation</response>
        [HttpGet("test")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<string>> TestAuth()
        {
            // Check if we have any users in the database
            if (!await _context.Users.AnyAsync())
            {
                // Seed some test users
                await SeedTestUsers();
                return "Test users created successfully. Try logging in with superadmin@example.com / password123";
            }

            // Return user emails for testing
            var users = await _context.Users
                .Where(u => u.Active)
                .Select(u => new { u.Email, u.Role })
                .ToListAsync();

            return Ok(new { 
                message = "Auth system is ready for testing. Use one of these users to login:",
                users = users
            });
        }

        /// <summary>
        /// Protected endpoint that requires authentication to test JWT token
        /// </summary>
        /// <returns>Authentication information from the JWT token</returns>
        /// <response code="200">Returns claims from the JWT token</response>
        /// <response code="401">If the token is invalid or missing</response>
        [HttpGet("protected")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public ActionResult<object> ProtectedEndpoint()
        {
            var currentUser = User?.Identity?.Name;
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            
            return new
            {
                message = "This is a protected endpoint that requires authentication",
                userName = currentUser,
                userId = userId,
                role = userRole,
                claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
            };
        }

        private async Task SeedTestUsers()
        {
            // Create a default company
            var company = new Company
            {
                Id = Guid.NewGuid(),
                Name = "Test Company",
                Ice = "12345678",
                If = "87654321",
                Rc = "RC12345",
                Cnss = "CNSS12345",
                Address = "123 Test Street",
                City = "Casablanca",
                Phone = "0612345678",
                Email = "contact@testcompany.com",
                LogoUrl = "",
                Website = "",
                Rib = ""
            };

            _context.Companies.Add(company);

            // Create test users with different roles
            var users = new List<User>
            {
                new User
                {
                    Id = Guid.NewGuid(),
                    Name = "Super Admin",
                    Email = "superadmin@example.com",
                    PasswordHash = "password123", // In a real app, this would be hashed
                    Role = UserRole.SuperAdmin,
                    Active = true
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Name = "Admin User",
                    Email = "admin@example.com",
                    PasswordHash = "password123", // In a real app, this would be hashed
                    Role = UserRole.Admin,
                    CompanyId = company.Id,
                    Active = true
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Name = "Comptable User",
                    Email = "comptable@example.com",
                    PasswordHash = "password123", // In a real app, this would be hashed
                    Role = UserRole.Comptable,
                    CompanyId = company.Id,
                    Active = true
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Name = "Commercial User",
                    Email = "commercial@example.com",
                    PasswordHash = "password123", // In a real app, this would be hashed
                    Role = UserRole.Commercial,
                    CompanyId = company.Id,
                    Active = true
                }
            };

            _context.Users.AddRange(users);
            await _context.SaveChangesAsync();
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecurityKey"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            if (user.CompanyId.HasValue)
            {
                claims.Add(new Claim("CompanyId", user.CompanyId.Value.ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["ExpiryInMinutes"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken(User user)
        {
            // In a real app, you would generate a secure random string
            // and store it in your database along with an expiry time
            // For this example, we'll just create a signed JWT with a longer expiry
            
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecurityKey"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("uid", user.Id.ToString()),
                new Claim("purpose", "refresh")
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(30), // Refresh tokens typically have a longer lifespan
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private Guid? ValidateRefreshToken(string refreshToken)
        {
            try
            {
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var tokenHandler = new JwtSecurityTokenHandler();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecurityKey"])),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                SecurityToken validatedToken;
                var principal = tokenHandler.ValidateToken(refreshToken, validationParameters, out validatedToken);

                // Check if this is a refresh token
                var purposeClaim = principal.FindFirst("purpose");
                if (purposeClaim == null || purposeClaim.Value != "refresh")
                {
                    return null;
                }

                // Extract user ID
                var userIdClaim = principal.FindFirst("uid");
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return userId;
                }
            }
            catch
            {
                // Token validation failed
            }

            return null;
        }

        private string GeneratePasswordResetToken(User user)
        {
            // In a real app, you would generate a secure random string
            // and store it in your database along with an expiry time
            // For this simple example, we'll just use a JWT token

            var jwtSettings = _configuration.GetSection("JwtSettings");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecurityKey"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("uid", user.Id.ToString()),
                new Claim("purpose", "password-reset")
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1), // Password reset tokens typically expire after a short time
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateEmailVerificationToken(User user)
        {
            // Similar to password reset token, but for email verification
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecurityKey"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("uid", user.Id.ToString()),
                new Claim("purpose", "email-verification")
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7), // Give users some time to verify their email
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
} 