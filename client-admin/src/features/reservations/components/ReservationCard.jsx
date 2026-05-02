// src/features/reservations/components/ReservationCard.jsx
const STATUS_META = {
    PENDIENTE:  { label: 'Pendiente',  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  dot: true  },
    CONFIRMADA: { label: 'Confirmada', color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)',  dot: true  },
    CANCELADA:  { label: 'Cancelada',  color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', dot: false },
    FINALIZADA: { label: 'Finalizada', color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', dot: false },
};

const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-GT', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

export const ReservationCard = ({ reservation, onEdit, onDelete, onConfirmToken, isResAdmin }) => {
    const st = STATUS_META[reservation.status] || STATUS_META.PENDIENTE;
    const table = reservation.tableId;
    const canEdit   = ['PENDIENTE', 'CONFIRMADA'].includes(reservation.status);
    const canDelete = reservation.status !== 'CONFIRMADA';

    return (
        <div
            style={{
                background: '#111118',
                border: `1px solid ${st.border}`,
                borderRadius: 14,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                transition: 'transform 0.18s, box-shadow 0.18s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* ── Header: estado + restaurante ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                    background: st.bg, color: st.color,
                    border: `1px solid ${st.border}`,
                    fontSize: 11, fontWeight: 700,
                    padding: '2px 10px', borderRadius: 20,
                    letterSpacing: '0.04em',
                    display: 'flex', alignItems: 'center', gap: 5,
                }}>
                    {st.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, display: 'inline-block' }} />}
                    {st.label}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                    🍽 {reservation.restaurantName}
                </span>
            </div>

            {/* ── Nombre titular ── */}
            <div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: 0 }}>
                    {reservation.peopleName}
                </h3>
                {reservation.observation && (
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '4px 0 0', fontStyle: 'italic' }}>
                        "{reservation.observation}"
                    </p>
                )}
            </div>

            {/* ── Fecha, hora, personas ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                        📅 {fmtDate(reservation.reservationDate)}
                    </span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                        🕐 {reservation.reservationHour}
                    </span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                        👥 {reservation.peopleNumber} persona{reservation.peopleNumber !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Mesa asignada */}
                {table && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                        <span style={{
                            background: 'rgba(147,98,217,0.12)', color: '#9362D9',
                            border: '1px solid rgba(147,98,217,0.25)',
                            fontSize: 11, fontWeight: 600,
                            padding: '2px 10px', borderRadius: 20,
                        }}>
                            Mesa {table.tableNumber}
                        </span>
                        {table.capacity && (
                            <span style={{
                                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                fontSize: 11, padding: '2px 10px', borderRadius: 20,
                            }}>
                                Cap. {table.capacity}
                            </span>
                        )}
                        {table.location && (
                            <span style={{
                                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                fontSize: 11, padding: '2px 10px', borderRadius: 20,
                            }}>
                                {table.location}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Token de confirmación (solo si está PENDIENTE y hay token) ── */}
            {reservation.status === 'PENDIENTE' && onConfirmToken && (
                <div style={{
                    background: 'rgba(251,191,36,0.06)',
                    border: '1px solid rgba(251,191,36,0.15)',
                    borderRadius: 8, padding: '8px 12px',
                }}>
                    <p style={{ color: 'rgba(251,191,36,0.8)', fontSize: 11, margin: 0, fontWeight: 600 }}>
                        ⚠ Reservación pendiente de confirmación
                    </p>
                </div>
            )}

            {/* ── Acciones ── */}
            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                {canEdit && (
                    <button
                        onClick={() => onEdit(reservation)}
                        style={{
                            flex: 1, background: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.7)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8, padding: '7px 0',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    >
                        Editar
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={() => onDelete(reservation._id)}
                        style={{
                            flex: 1, background: 'rgba(248,113,113,0.08)',
                            color: '#f87171',
                            border: '1px solid rgba(248,113,113,0.2)',
                            borderRadius: 8, padding: '7px 0',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                    >
                        Eliminar
                    </button>
                )}
            </div>
        </div>
    );
};