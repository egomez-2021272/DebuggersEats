using System;

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using ReportService.Api.Data;
using ReportService.Api.Models;
using ReportService.Api.Models.DTOs;

namespace ReportService.Api.Services;
//arreglar
public class ReportServices
{
    private readonly IMongoCollection<OrderMongo> _orders;
    private readonly ReportsDbContext _db;
    private readonly TimeSpan _cacheDuration = TimeSpan.FromHours(1);

    public ReportServices(IConfiguration config, ReportsDbContext db)
    {
        var client = new MongoClient(config.GetConnectionString("MongoDB"));
        var database = client.GetDatabase(config["MongoDB:DatabaseName"]);
        _orders = database.GetCollection<OrderMongo>("orders");
        _db = db;
    }

    public async Task<ResumenRestauranteDto> GetResumenRestaurante(string restaurantId)
    {
        // 1. Buscar en caché PostgreSQL
        var cache = await _db.ReportesCache
            .Where(r => r.RestauranteId == restaurantId && r.EsRestaurante)
            .OrderByDescending(r => r.FechaCalculo)
            .FirstOrDefaultAsync();

        if (cache != null && DateTime.UtcNow - cache.FechaCalculo < _cacheDuration)
        {
            var cachedData = JsonSerializer.Deserialize<ResumenRestauranteDto>(cache.DatosJson)!;
            cachedData.Fuente = "cache";
            return cachedData;
        }

        var filter = Builders<OrderMongo>.Filter.And(
            Builders<OrderMongo>.Filter.Eq(o => o.RestaurantId, restaurantId),
            Builders<OrderMongo>.Filter.Eq(o => o.Status, "Entregado")
        );

        var orders = await _orders.Find(filter).ToListAsync();

        var resumen = new ResumenRestauranteDto
        {
            RestaurantId = restaurantId,
            TotalIngresos = orders.Sum(o => o.Total),
            TotalPedidos = orders.Count,
            PromedioTicket = orders.Count > 0 ? orders.Average(o => o.Total) : 0,
            FechaCalculo = DateTime.UtcNow,
            Fuente = "calculado",

            IngresosPorDia = orders
                .GroupBy(o => o.CreatedAt.ToString("yyyy-MM-dd"))
                .Select(g => new IngresosPorDiaDto
                {
                    Fecha = g.Key,
                    Ingresos = g.Sum(o => o.Total),
                    CantidadPedidos = g.Count()
                })
                .OrderBy(x => x.Fecha)
                .ToList(),

            PlatosMasVendidos = orders
                .SelectMany(o => o.Items)
                .GroupBy(i => i.Nombre)
                .Select(g => new PlatoMasVendidoDto
                {
                    Nombre = g.Key,
                    CantidadVendida = g.Sum(i => i.Cantidad),
                    IngresoGenerado = g.Sum(i => i.Subtotal)
                })
                .OrderByDescending(x => x.CantidadVendida)
                .Take(10)
                .ToList(),

            HorasPico = orders
                .GroupBy(o => o.CreatedAt.Hour)
                .Select(g => new HoraPicoDto
                {
                    Hora = g.Key,
                    HoraFormateada = $"{g.Key:00}:00 - {g.Key:00}:59",
                    CantidadPedidos = g.Count()
                })
                .OrderByDescending(x => x.CantidadPedidos)
                .ToList()
        };

        // 3. Guardar en PostgreSQL
        _db.ReportesCache.Add(new ReporteCache
        {
            RestauranteId = restaurantId,
            FechaCalculo = DateTime.UtcNow,
            DatosJson = JsonSerializer.Serialize(resumen),
            EsRestaurante = true
        });
        await _db.SaveChangesAsync();

        return resumen;
    }

    public async Task<ResumenPlataformaDto> GetResumenPlataforma()
    {
        var cache = await _db.ReportesCache
            .Where(r => r.RestauranteId == "plataforma" && !r.EsRestaurante)
            .OrderByDescending(r => r.FechaCalculo)
            .FirstOrDefaultAsync();

        if (cache != null && DateTime.UtcNow - cache.FechaCalculo < _cacheDuration)
            return JsonSerializer.Deserialize<ResumenPlataformaDto>(cache.DatosJson)!;

        var filter = Builders<OrderMongo>.Filter.Eq(o => o.Status, "Entregado");
        var orders = await _orders.Find(filter).ToListAsync();

        var resumen = new ResumenPlataformaDto
        {
            TotalIngresosPlataforma = orders.Sum(o => o.Total),
            TotalPedidosPlataforma = orders.Count,
            TotalRestaurantes = orders.Select(o => o.RestaurantId).Distinct().Count(),
            FechaCalculo = DateTime.UtcNow,
            PlatosMasVendidosGlobal = orders
                .SelectMany(o => o.Items)
                .GroupBy(i => i.Nombre)
                .Select(g => new PlatoMasVendidoDto
                {
                    Nombre = g.Key,
                    CantidadVendida = g.Sum(i => i.Cantidad),
                    IngresoGenerado = g.Sum(i => i.Subtotal)
                })
                .OrderByDescending(x => x.CantidadVendida)
                .Take(10)
                .ToList()
        };

        _db.ReportesCache.Add(new ReporteCache
        {
            RestauranteId = "plataforma",
            FechaCalculo = DateTime.UtcNow,
            DatosJson = JsonSerializer.Serialize(resumen),
            EsRestaurante = false
        });
        await _db.SaveChangesAsync();

        return resumen;
    }

    public async Task LimpiarCache(string restaurantId)
    {
        var caches = _db.ReportesCache.Where(r => r.RestauranteId == restaurantId);
        _db.ReportesCache.RemoveRange(caches);
        await _db.SaveChangesAsync();
    }
}
