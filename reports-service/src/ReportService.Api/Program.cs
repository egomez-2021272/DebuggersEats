using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.EntityFrameworkCore;
using ReportService.Api.Data;
using ReportService.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<ReportsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL")));
builder.Services.AddScoped<ReportServices>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ReportsDbContext>();
    db.Database.EnsureCreated();
}

var startupLogger = app.Services.GetRequiredService<ILogger<Program>>();
app.Lifetime.ApplicationStarted.Register(() =>
{
    try
    {
        var server = app.Services.GetRequiredService<IServer>();
        var addressesFeature = server.Features.Get<IServerAddressesFeature>();
        var addresses = (IEnumerable<string>?)addressesFeature?.Addresses ?? app.Urls;

        if (addresses != null && addresses.Any())
        {
            foreach (var addr in addresses)
            {
                var health = $"{addr.TrimEnd('/')}/api/reports/health";
                startupLogger.LogInformation("El API de ReportService está ejecutándose en {Url}. Endpoint de salud: {HealthUrl}", addr, health);
            }
        }
        else
        {
            startupLogger.LogInformation("API de ReportService iniciada. Endpoint de salud: /api/reports/health");
        }
    }
    catch (Exception ex)
    {
        startupLogger.LogWarning(ex, "Fallo al determinar las direcciones de escucha para el log de inicio");
    }
});

app.UseCors();
app.MapControllers();
app.Run();

