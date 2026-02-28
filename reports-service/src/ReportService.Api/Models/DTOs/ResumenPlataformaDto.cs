using System;

namespace ReportService.Api.Models.DTOs;

public class ResumenPlataformaDto
{
    public decimal TotalIngresosPlataforma { get; set; }
    public int TotalPedidosPlataforma { get; set; }
    public int TotalRestaurantes { get; set; }
    public List<PlatoMasVendidoDto> PlatosMasVendidosGlobal { get; set; } = new();
    public DateTime FechaCalculo { get; set; }
}
