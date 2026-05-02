
import { useState, useEffect } from 'react';
import { useReservationStore } from '../store/reservationStore.js';

const inputSx = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '8px 12px',
    color: '#fff', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', colorScheme: 'dark',
};

const Lbl = ({ text, req }) => (
    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>
        {text} {req && <span style={{ color: '#F2509C' }}>*</span>}
    </label>
);

const Section = ({ title, children }) => (
    <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '0 0 12px' }}>
            {title}
        </p>
        {children}
    </div>
);

const INIT = {
    peopleName: '',
    restaurantName: '',
    restaurantId: '',
    reservationDate: '',
    reservationHour: '',
    peopleNumber: 1,
    tableId: '',
    observation: '',
};

export const ReservationModal = ({ reservation, restaurants, onSave, onClose, saving }) => {
    const isEdit = Boolean(reservation?._id);
    const { tables, availableTables, loadingTables, fetchTables, fetchDisponibilidad, clearAvailableTables } = useReservationStore();

    const [form, setForm] = useState(() => {
        if (!reservation) return { ...INIT };
        return {
            peopleName: reservation.peopleName || '',
            restaurantName: reservation.restaurantName || '',
            restaurantId: restaurants.find(r => r.name === reservation.restaurantName)?._id || '',
            reservationDate: reservation.reservationDate ? reservation.reservationDate.slice(0, 10) : '',
            reservationHour: reservation.reservationHour || '',
            peopleNumber: reservation.peopleNumber || 1,
            tableId: reservation.tableId?._id || reservation.tableId || '',
            observation: reservation.observation || '',
        };
    });

    const [error, setError] = useState('');
    const [dispInfo, setDispInfo] = useState(null);
    const [checkingDisp, setCheckingDisp] = useState(false);
    const [tokenResult, setTokenResult] = useState(null);

    // Cargar mesas cuando se selecciona restaurante
    useEffect(() => {
        if (form.restaurantId) {
            fetchTables(form.restaurantId);
            clearAvailableTables();
            setDispInfo(null);
        }
    }, [form.restaurantId]);

    const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleRestaurantChange = (restaurantId) => {
        const rest = restaurants.find(r => r._id === restaurantId);
        setF('restaurantId', restaurantId);
        setF('restaurantName', rest?.name || '');
        setF('tableId', '');
        setDispInfo(null);
        clearAvailableTables();
    };

    const handleCheckDisp = async () => {
        if (!form.restaurantName || !form.reservationDate || !form.reservationHour) {
            setError('Completa restaurante, fecha y hora para verificar disponibilidad.');
            return;
        }
        setError('');
        setCheckingDisp(true);
        const result = await fetchDisponibilidad(form.restaurantName, form.reservationDate, form.reservationHour);
        setDispInfo(result);
        setCheckingDisp(false);
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.peopleName.trim()) return setError('El nombre del titular es requerido.');
        if (!form.restaurantName) return setError('Selecciona un restaurante.');
        if (!form.reservationDate) return setError('La fecha es requerida.');
        if (!form.reservationHour) return setError('La hora es requerida.');
        if (!form.tableId) {
            if (tables.length === 0 && form.restaurantId) {
                return setError('Este restaurante no tiene mesas registradas. Crea mesas primero desde el panel de Mesas.');
            }
            return setError('Selecciona una mesa.');
        }
        if (!form.peopleNumber || form.peopleNumber < 1) return setError('El número de personas es requerido.');

        const payload = {
            peopleName: form.peopleName.trim(),
            restaurantName: form.restaurantName,
            reservationDate: form.reservationDate,
            reservationHour: form.reservationHour,
            peopleNumber: Number(form.peopleNumber),
            tableId: form.tableId,
            observation: form.observation.trim() || undefined,
        };

        const res = await onSave(payload, isEdit ? reservation._id : null);

        if (res?.success && !isEdit && res.confirmationToken) {
            setTokenResult({ token: res.confirmationToken, expiresAt: res.tokenExpiresAt });
        } else if (!res?.success) {
            setError(res?.error || 'Error al guardar');
        }
    };

    // Pantalla de token de confirmación (solo al crear)
    if (tokenResult) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <div style={{ background: '#111118', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 16, maxWidth: 480, width: '100%', padding: '32px 28px', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                    <h2 style={{ color: '#4ade80', fontWeight: 700, fontSize: 18, margin: '0 0 6px' }}>¡Reservación creada!</h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '0 0 24px' }}>
                        Usa el token para confirmar o cancelar la reservación.
                    </p>

                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'left' }}>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 6px' }}>Token de confirmación</p>
                        <code style={{ color: '#F2509C', fontSize: 12, wordBreak: 'break-all', lineHeight: 1.6 }}>
                            {tokenResult.token}
                        </code>
                        {tokenResult.expiresAt && (
                            <p style={{ color: 'rgba(251,191,36,0.7)', fontSize: 11, margin: '8px 0 0' }}>
                                ⚠ Expira: {new Date(tokenResult.expiresAt).toLocaleString('es-GT')}
                            </p>
                        )}
                    </div>

                    <button onClick={onClose} style={{ width: '100%', background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 10, padding: '11px 0', cursor: 'pointer' }}>
                        Entendido
                    </button>
                </div>
            </div>
        );
    }

    // Mesas a mostrar: si se verificó disponibilidad → las disponibles, si no → todas las del restaurante
    const mesasToShow = dispInfo ? availableTables : tables;

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: '#111118', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, width: '100%', maxWidth: 560,
                maxHeight: '90vh', overflowY: 'auto', padding: '28px 28px', scrollbarWidth: 'thin',
            }}>
                {/* Encabezado */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: 0 }}>
                            {isEdit ? 'Editar reservación' : 'Nueva reservación'}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '2px 0 0' }}>
                            Máximo 3 reservaciones activas por usuario
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
                </div>

                {/* ── Info del titular ── */}
                <Section title="Titular">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div style={{ gridColumn: '1/-1' }}>
                            <Lbl text="Nombre del titular" req />
                            <input style={inputSx} value={form.peopleName}
                                onChange={(e) => setF('peopleName', e.target.value)}
                                placeholder="Ej. Juan Pérez" />
                        </div>
                        <div>
                            <Lbl text="Número de personas" req />
                            <input type="number" min="1" max="20" style={inputSx}
                                value={form.peopleNumber}
                                onChange={(e) => setF('peopleNumber', e.target.value)} />
                        </div>
                        <div>
                            <Lbl text="Observaciones" />
                            <input style={inputSx} value={form.observation}
                                onChange={(e) => setF('observation', e.target.value)}
                                placeholder="Ej. Mesa cerca de la ventana" />
                        </div>
                    </div>
                </Section>

                {/* ── Restaurante ── */}
                <Section title="Restaurante">
                    <Lbl text="Restaurante" req />
                    <select
                        style={{ ...inputSx, cursor: 'pointer' }}
                        value={form.restaurantId}
                        onChange={(e) => handleRestaurantChange(e.target.value)}
                    >
                        <option value="">— Seleccionar restaurante —</option>
                        {restaurants.map((r) => (
                            <option key={r._id} value={r._id}>{r.name}</option>
                        ))}
                    </select>
                </Section>

                {/* ── Fecha y hora + verificar disponibilidad ── */}
                <Section title="Fecha y hora">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                            <Lbl text="Fecha" req />
                            <input type="date" style={inputSx}
                                value={form.reservationDate}
                                onChange={(e) => { setF('reservationDate', e.target.value); setDispInfo(null); }} />
                        </div>
                        <div>
                            <Lbl text="Hora" req />
                            <input type="time" style={inputSx}
                                value={form.reservationHour}
                                onChange={(e) => { setF('reservationHour', e.target.value); setDispInfo(null); }} />
                        </div>
                    </div>

                    {/* Botón verificar disponibilidad */}
                    <button
                        onClick={handleCheckDisp}
                        disabled={checkingDisp || !form.restaurantName || !form.reservationDate || !form.reservationHour}
                        style={{
                            marginTop: 10, width: '100%',
                            background: 'rgba(147,98,217,0.15)',
                            border: '1px solid rgba(147,98,217,0.3)',
                            color: '#9362D9', borderRadius: 8,
                            padding: '8px 0', fontSize: 12, fontWeight: 700,
                            cursor: checkingDisp ? 'wait' : 'pointer',
                            opacity: (!form.restaurantName || !form.reservationDate || !form.reservationHour) ? 0.4 : 1,
                            transition: 'all 0.15s',
                        }}
                    >
                        {checkingDisp ? 'Verificando...' : '🔍 Verificar disponibilidad'}
                    </button>

                    {/* Resultado disponibilidad */}
                    {dispInfo && (
                        <div style={{
                            marginTop: 10,
                            background: dispInfo.disponible ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)',
                            border: `1px solid ${dispInfo.disponible ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                            borderRadius: 8, padding: '10px 14px',
                        }}>
                            <p style={{ color: dispInfo.disponible ? '#4ade80' : '#f87171', fontSize: 12, fontWeight: 700, margin: '0 0 2px' }}>
                                {dispInfo.disponible ? '✓ ' : '✗ '}{dispInfo.mensaje}
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>
                                {dispInfo.mesasDisponibles} mesa{dispInfo.mesasDisponibles !== 1 ? 's' : ''} disponible{dispInfo.mesasDisponibles !== 1 ? 's' : ''} de {dispInfo.totalMesas}
                            </p>
                        </div>
                    )}
                </Section>

                {/* ── Selección de mesa ── */}
                <Section title="Mesa">
                    <Lbl text={dispInfo ? 'Mesas disponibles para ese horario' : 'Mesas del restaurante'} req />
                    {loadingTables ? (
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Cargando mesas...</p>
                    ) : mesasToShow.length === 0 ? (
                        <div style={{
                            background: 'rgba(251,191,36,0.06)',
                            border: '1px solid rgba(251,191,36,0.2)',
                            borderRadius: 8, padding: '10px 14px',
                        }}>
                            <p style={{ color: 'rgba(251,191,36,0.85)', fontSize: 13, margin: 0 }}>
                                {!form.restaurantId
                                    ? 'Selecciona un restaurante primero.'
                                    : dispInfo
                                        ? 'No hay mesas disponibles para ese horario. Intenta con otra fecha u hora.'
                                        : tables.length === 0
                                            ? 'Este restaurante no tiene mesas registradas. Debes crear mesas desde el panel de Mesas antes de hacer una reservacion.'
                                            : 'No hay mesas disponibles. Verifica disponibilidad con otra fecha u hora.'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                            {mesasToShow.map((t) => {
                                const sel = form.tableId === (t._id || t.id);
                                return (
                                    <button
                                        key={t._id || t.id}
                                        onClick={() => setF('tableId', t._id || t.id)}
                                        style={{
                                            background: sel ? 'rgba(147,98,217,0.2)' : 'rgba(255,255,255,0.04)',
                                            border: sel ? '1px solid #9362D9' : '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: 10, padding: '10px 8px',
                                            cursor: 'pointer', textAlign: 'center',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <p style={{ color: sel ? '#9362D9' : '#fff', fontWeight: 700, fontSize: 13, margin: '0 0 2px' }}>
                                            Mesa {t.tableNumber}
                                        </p>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>
                                            👥 {t.capacity} · {t.location || 'Interior'}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </Section>

                {/* Error */}
                {error && (
                    <p style={{ color: '#f87171', fontSize: 13, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '8px 12px', margin: '0 0 16px' }}>
                        {error}
                    </p>
                )}

                {/* Botones */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} disabled={saving} style={{
                        padding: '9px 24px', borderRadius: 8, border: 'none',
                        background: saving ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)',
                        color: '#fff', fontSize: 13, fontWeight: 700,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s',
                    }}>
                        {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear reservación'}
                    </button>
                </div>
            </div>
        </div>
    );
};