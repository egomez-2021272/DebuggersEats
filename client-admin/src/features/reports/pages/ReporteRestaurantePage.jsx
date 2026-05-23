import { useEffect, useState } from 'react';
import { useReports } from '../hooks/useReports.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import { FuenteBadge } from '../components/FuenteBadge.jsx';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { showError } from '../../../shared/utils/toast.js';

const StatCard = ({ label, value, sub }) => (
    <div className='rounded-xl bg-[#16161f] border border-white/[0.06] p-4 space-y-1'>
        <p className='text-xs font-semibold text-white/40 uppercase tracking-wider'>{label}</p>
        <p className='text-2xl font-bold text-white'>{value}</p>
        {sub && <p className='text-xs text-white/30'>{sub}</p>}
    </div>
);

const BarChart = ({ data, labelKey, valueKey, formatValue }) => {
    const max = Math.max(...data.map((d) => d[valueKey]), 1);
    return (
        <ul className='space-y-2 list-none p-0 m-0'>
            {data.map((item, idx) => {
                const pct = Math.round((item[valueKey] / max) * 100);
                return (
                    <li key={idx} className='flex items-center gap-3 text-xs'>
                        <span className='w-20 shrink-0 text-white/50 truncate text-right'>
                            {item[labelKey]}
                        </span>
                        <div className='flex-1 h-5 rounded-md bg-white/[0.04] overflow-hidden'>
                            <div
                                className='h-full rounded-md transition-all duration-500'
                                style={{
                                    width: `${pct}%`,
                                    background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)',
                                    opacity: 0.7 + (pct / 100) * 0.3,
                                }}
                            />
                        </div>
                        <span className='w-20 shrink-0 text-white/70 font-semibold'>
                            {formatValue ? formatValue(item[valueKey]) : item[valueKey]}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
};

const Section = ({ title, children }) => (
    <div className='rounded-xl bg-[#16161f] border border-white/[0.06] p-5 space-y-4'>
        <p className='text-xs font-semibold text-white/50 uppercase tracking-wider'>{title}</p>
        {children}
    </div>
);

export const ReporteRestaurantePage = () => {
    const { reporte, loading, error, fetchReporte, limpiarCache } = useReports();
    const { openConfirm } = useUIStore();
    const [tab, setTab] = useState('ingresos');

    useEffect(() => {
        fetchReporte();
    }, [fetchReporte]);

    useEffect(() => {
        if (error) showError(error);
    }, [error]);

    const handleLimpiarCache = () =>
        openConfirm({
            title: 'Limpiar caché',
            message: 'Se recalculará el reporte desde cero consultando MongoDB. ¿Continuar?',
            onConfirm: limpiarCache,
        });

    if (loading && !reporte) return <Spinner />;

    return (
        <section className='p-4 space-y-5'>
            <header className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                <hgroup>
                    <h1 className='text-3xl font-bold text-white'>Reporte del restaurante</h1>
                    <div className='flex items-center gap-3 mt-1'>
                        <p className='text-sm text-white/50'>
                            {reporte?.fechaCalculo
                                ? `Calculado el ${new Date(reporte.fechaCalculo).toLocaleString('es-GT')}`
                                : 'Sin datos aún'}
                        </p>
                        {reporte && <FuenteBadge fuente={reporte.fuente} />}
                    </div>
                </hgroup>
                <div className='flex gap-2 self-start md:self-auto'>
                    <button
                        onClick={handleLimpiarCache}
                        disabled={loading}
                        className='px-4 py-2 rounded-lg text-sm font-semibold text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-50'
                    >
                        {loading ? '...' : 'Forzar recálculo'}
                    </button>
                </div>
            </header>

            {!reporte ? (
                <p className='rounded-xl p-6 text-center text-sm text-white/30 bg-[#16161f] border border-white/[0.06]'>
                    No hay datos de reportes aún.
                </p>
            ) : (
                <div className='space-y-5'>
                    <div className='grid grid-cols-2 xl:grid-cols-4 gap-3'>
                        <StatCard label='Ingresos totales' value={`Q${reporte.totalIngresos?.toFixed(2)}`} />
                        <StatCard label='Pedidos entregados' value={reporte.totalPedidos} />
                        <StatCard label='Ticket promedio' value={`Q${reporte.promedioTicket?.toFixed(2)}`} />
                        <StatCard
                            label='Platos en menú'
                            value={reporte.platosMasVendidos?.length ?? 0}
                            sub='con ventas registradas'
                        />
                    </div>

                    <div className='flex gap-2 flex-wrap'>
                        {[
                            { key: 'ingresos', label: 'Ingresos por día' },
                            { key: 'platos', label: 'Platos más vendidos' },
                            { key: 'horas', label: 'Horas pico' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${tab === key
                                        ? 'text-white'
                                        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                                    }`}
                                style={
                                    tab === key
                                        ? { background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)' }
                                        : {}
                                }
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {tab === 'ingresos' && (
                        <Section title='Ingresos por día'>
                            {reporte.ingresosPorDia?.length === 0 ? (
                                <p className='text-sm text-white/30'>Sin datos.</p>
                            ) : (
                                <>
                                    <BarChart
                                        data={reporte.ingresosPorDia}
                                        labelKey='fecha'
                                        valueKey='ingresos'
                                        formatValue={(v) => `Q${v.toFixed(2)}`}
                                    />
                                    <div className='mt-3 overflow-x-auto'>
                                        <table className='w-full text-xs text-white/60 border-collapse'>
                                            <thead>
                                                <tr className='border-b border-white/[0.06]'>
                                                    <th className='text-left py-2 text-white/40 font-semibold uppercase tracking-wider'>Fecha</th>
                                                    <th className='text-right py-2 text-white/40 font-semibold uppercase tracking-wider'>Ingresos</th>
                                                    <th className='text-right py-2 text-white/40 font-semibold uppercase tracking-wider'>Pedidos</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reporte.ingresosPorDia.map((row, idx) => (
                                                    <tr key={idx} className='border-b border-white/[0.03] hover:bg-white/[0.02]'>
                                                        <td className='py-2'>{row.fecha}</td>
                                                        <td className='py-2 text-right text-white font-semibold'>Q{row.ingresos.toFixed(2)}</td>
                                                        <td className='py-2 text-right'>{row.cantidadPedidos}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </Section>
                    )}

                    {tab === 'platos' && (
                        <Section title='Top 10 platos más vendidos'>
                            {reporte.platosMasVendidos?.length === 0 ? (
                                <p className='text-sm text-white/30'>Sin datos.</p>
                            ) : (
                                <>
                                    <BarChart
                                        data={reporte.platosMasVendidos}
                                        labelKey='nombre'
                                        valueKey='cantidadVendida'
                                        formatValue={(v) => `${v} uds`}
                                    />
                                    <div className='mt-3 overflow-x-auto'>
                                        <table className='w-full text-xs text-white/60 border-collapse'>
                                            <thead>
                                                <tr className='border-b border-white/[0.06]'>
                                                    <th className='text-left py-2 text-white/40 font-semibold uppercase tracking-wider'>#</th>
                                                    <th className='text-left py-2 text-white/40 font-semibold uppercase tracking-wider'>Plato</th>
                                                    <th className='text-right py-2 text-white/40 font-semibold uppercase tracking-wider'>Vendidos</th>
                                                    <th className='text-right py-2 text-white/40 font-semibold uppercase tracking-wider'>Ingresos</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reporte.platosMasVendidos.map((row, idx) => (
                                                    <tr key={idx} className='border-b border-white/[0.03] hover:bg-white/[0.02]'>
                                                        <td className='py-2 text-white/20'>{idx + 1}</td>
                                                        <td className='py-2 text-white/80 font-medium'>{row.nombre}</td>
                                                        <td className='py-2 text-right'>{row.cantidadVendida}</td>
                                                        <td className='py-2 text-right text-white font-semibold'>Q{row.ingresoGenerado.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </Section>
                    )}

                    {tab === 'horas' && (
                        <Section title='Horas pico (hora local Guatemala)'>
                            {reporte.horasPico?.length === 0 ? (
                                <p className='text-sm text-white/30'>Sin datos.</p>
                            ) : (
                                <>
                                    <BarChart
                                        data={reporte.horasPico}
                                        labelKey='horaFormateada'
                                        valueKey='cantidadPedidos'
                                        formatValue={(v) => `${v} pedidos`}
                                    />
                                    <div className='mt-3 overflow-x-auto'>
                                        <table className='w-full text-xs text-white/60 border-collapse'>
                                            <thead>
                                                <tr className='border-b border-white/[0.06]'>
                                                    <th className='text-left py-2 text-white/40 font-semibold uppercase tracking-wider'>Hora</th>
                                                    <th className='text-right py-2 text-white/40 font-semibold uppercase tracking-wider'>Pedidos</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reporte.horasPico.map((row, idx) => (
                                                    <tr key={idx} className='border-b border-white/[0.03] hover:bg-white/[0.02]'>
                                                        <td className='py-2 text-white/70'>{row.horaFormateada}</td>
                                                        <td className='py-2 text-right text-white font-semibold'>{row.cantidadPedidos}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </Section>
                    )}
                </div>
            )}
        </section>
    );
};