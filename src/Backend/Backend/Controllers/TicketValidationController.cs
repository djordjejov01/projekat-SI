using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.WebUtilities;
using System.Collections.Generic;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketValidationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IStringLocalizer<SharedResource> _localizer;
        private readonly IConfiguration _configuration;

        public TicketValidationController(AppDbContext context, IStringLocalizer<SharedResource> localizer, IConfiguration configuration)
        {
            _context = context;
            _localizer = localizer;
            _configuration = configuration;
        }

        [HttpGet("validate/{userTicketId}/{token}")]
        public async Task<IActionResult> ValidateTicket(int userTicketId, string token)
        {
            var userTicket = await _context.UserTickets
                .Include(ut => ut.Ticket)
                .Include(ut => ut.User)
                .FirstOrDefaultAsync(ut => ut.UserTicketID == userTicketId);

            if (userTicket == null)
            {
                return BuildResult(new TicketValidationDto
                {
                    Status = "invalid",
                    Message = _localizer["ticket_validation.not_found"].ToString()
                }, code: "not_found");
            }

            if (userTicket.ValidationToken != token)
            {
                return BuildResult(new TicketValidationDto
                {
                    Status = "invalid",
                    Message = _localizer["ticket_validation.invalid_token"].ToString()
                }, code: "invalid_token");
            }

            if (userTicket.IsUsed)
            {
                return BuildResult(new TicketValidationDto
                {
                    Status = "invalid",
                    Message = string.Format(_localizer["ticket_validation.already_used"].ToString(), userTicket.UsedAt?.ToString("HH:mm:ss")),
                    UsedAt = userTicket.UsedAt
                }, code: "already_used", usedAt: userTicket.UsedAt);
            }

            userTicket.IsUsed = true;
            userTicket.UsedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return BuildResult(new TicketValidationDto
            {
                Status = "valid",
                Message = _localizer["ticket_validation.valid"].ToString(),
                UsedAt = userTicket.UsedAt
            }, code: "valid", usedAt: userTicket.UsedAt);
        }

        private IActionResult BuildResult(TicketValidationDto dto, string code, DateTime? usedAt = null)
        {
            // Ako je browser/QR, preusmeri; ako je API (JSON), vrati JSON
            var wantsRedirect = IsBrowserLikeRequest() || Request.Query.TryGetValue("redirect", out var r) && r == "1";
            if (!wantsRedirect)
            {
                if (dto.Status == "invalid") return BadRequest(dto);
                return Ok(dto);
            }

            var baseUrl = _configuration["App:PublicBaseUrl"]?.TrimEnd('/') ?? "";
            var targetPath = dto.Status == "valid" ? "/verify/ticket/success" : "/verify/ticket/fail";

            var redirectUrl = QueryHelpers.AddQueryString(
                $"{baseUrl}{targetPath}",
                new Dictionary<string, string?>
                {
                    ["code"] = code,
                    ["usedAt"] = usedAt?.ToString("o")
                }
            );

            return Redirect(redirectUrl);
        }

        private bool IsBrowserLikeRequest()
        {
            var accept = Request.Headers["Accept"].ToString();
            if (!string.IsNullOrEmpty(accept) && accept.Contains("text/html", StringComparison.OrdinalIgnoreCase))
                return true;

            var ua = Request.Headers["User-Agent"].ToString();
            if (string.IsNullOrEmpty(ua)) return false;

            return ua.Contains("Chrome", StringComparison.OrdinalIgnoreCase)
                || ua.Contains("Safari", StringComparison.OrdinalIgnoreCase)
                || ua.Contains("Firefox", StringComparison.OrdinalIgnoreCase)
                || ua.Contains("Edg", StringComparison.OrdinalIgnoreCase);
        }
    }
}

