using Microsoft.AspNetCore.Mvc;
using ReportService.Api.Services;

namespace ReportService.Api.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly ReportServices _service;

    public ReportsController(ReportServices service)
    {
        _service = service;
    }

    [HttpGet("health")]
    public IActionResult Health() => Ok(new
    {
        status = "Healthy",
        service = "Debuggers Eats Reports Service",
        timestamp = DateTime.UtcNow
    });

    [HttpGet("restaurant/{restaurantId}")]
    public async Task<IActionResult> GetResumen(string restaurantId)
    {
        try
        {
            var resumen = await _service.GetResumenRestaurante(restaurantId);
            return Ok(new { success = true, data = resumen });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("plataforma")]
    public async Task<IActionResult> GetResumenPlataforma()
    {
        try
        {
            var resumen = await _service.GetResumenPlataforma();
            return Ok(new { success = true, data = resumen });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpDelete("cache/{restaurantId}")]
    public async Task<IActionResult> LimpiarCache(string restaurantId)
    {
        try
        {
            await _service.LimpiarCache(restaurantId);
            return Ok(new { success = true, message = "Caché limpiado exitosamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}