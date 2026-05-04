import { useState } from 'react';

const inputSx = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '8px 12px',
  color: '#fff',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
};

const Lbl = ({ text, req }) => (
  <label
    style={{
      fontSize: 12,
      color: 'rgba(255,255,255,0.5)',
      fontWeight: 600,
      letterSpacing: '0.04em',
      display: 'block',
      marginBottom: 4,
    }}
  >
    {text} {req && <span style={{ color: '#F2509C' }}>*</span>}
  </label>
);

const LOCATIONS = ['Interior', 'Terraza', 'Ventana', 'Jardín', 'Otro'];

export const TableModal = ({ table, restaurantId, onSave, onClose, saving }) => {
  const isEdit = Boolean(table?._id);

  const [form, setForm] = useState(() => {
    if (!table) return { tableNumber: '', capacity: 2, location: 'Interior', restaurantId };
    return {
      tableNumber: table.tableNumber || '',
      capacity: table.capacity || 2,
      location: table.location || 'Interior',
      restaurantId,
    };
  });

  const [error, setError] = useState('');
  const setF = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setError('');
    if (!form.tableNumber.trim()) return setError('El número o nombre de la mesa es requerido.');
    if (!form.capacity || form.capacity < 1 || form.capacity > 20)
      return setError('La capacidad debe estar entre 1 y 20 personas.');

    const payload = {
      restaurantId: form.restaurantId,
      tableNumber: form.tableNumber.trim(),
      capacity: Number(form.capacity),
      location: form.location || undefined,
    };

    const res = await onSave(payload, isEdit ? table._id : null);
    if (!res?.success) setError(res?.error || 'Error al guardar');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#111118',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 460,
          padding: '28px 28px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: 0 }}>
              {isEdit ? 'Editar mesa' : 'Nueva mesa'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '2px 0 0' }}>
              {isEdit ? 'Modifica los datos de la mesa' : 'Agrega una nueva mesa al restaurante'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Número */}
        <div style={{ marginBottom: 16 }}>
          <Lbl text='Número o nombre de la mesa' req />
          <input
            style={inputSx}
            value={form.tableNumber}
            onChange={(e) => setF('tableNumber', e.target.value)}
            placeholder='Ej. Mesa 5, VIP-1, Terraza-A'
            maxLength={20}
          />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '4px 0 0' }}>
            Máx. 20 caracteres · {form.tableNumber.length}/20
          </p>
        </div>

        {/* Capacidad */}
        <div style={{ marginBottom: 16 }}>
          <Lbl text='Capacidad (personas)' req />
          <input
            type='number'
            min={1}
            max={20}
            style={inputSx}
            value={form.capacity}
            onChange={(e) => setF('capacity', e.target.value)}
          />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '4px 0 0' }}>
            Entre 1 y 20 personas
          </p>
        </div>

        {/* Ubicación */}
        <div style={{ marginBottom: 24 }}>
          <Lbl text='Ubicación' />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {LOCATIONS.map((loc) => {
              const sel = form.location === loc;
              return (
                <button
                  key={loc}
                  onClick={() => setF('location', loc)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 20,
                    border: sel ? '1px solid #9362D9' : '1px solid rgba(255,255,255,0.1)',
                    background: sel ? 'rgba(147,98,217,0.2)' : 'rgba(255,255,255,0.04)',
                    color: sel ? '#9362D9' : 'rgba(255,255,255,0.5)',
                    fontSize: 12,
                    fontWeight: sel ? 700 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p
            style={{
              color: '#f87171',
              fontSize: 13,
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 8,
              padding: '8px 12px',
              margin: '0 0 16px',
            }}
          >
            {error}
          </p>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'none',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: '9px 24px',
              borderRadius: 8,
              border: 'none',
              background: saving
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear mesa'}
          </button>
        </div>
      </div>
    </div>
  );
};
