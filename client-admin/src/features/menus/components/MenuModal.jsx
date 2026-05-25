import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { useRestaurantStore } from '../../restaurants/store/restaurantStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';

const CATEGORIES = [
  { value: 'DESAYUNO', label: 'Desayuno' },
  { value: 'ALMUERZO', label: 'Almuerzo' },
  { value: 'CENA', label: 'Cena' },
  { value: 'BEBIDA', label: 'Bebida' },
  { value: 'POSTRE', label: 'Postre' },
];

const DAYS = [
  { value: 'LUNES', label: 'L' },
  { value: 'MARTES', label: 'M' },
  { value: 'MIERCOLES', label: 'W' },
  { value: 'JUEVES', label: 'J' },
  { value: 'VIERNES', label: 'V' },
  { value: 'SABADO', label: 'S' },
  { value: 'DOMINGO', label: 'D' },
];

export const MenuModal = ({
  isOpen,
  onClose,
  onSave,
  loading,
  menu,
  restaurantId: propRestaurantId,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const [preview, setPreview] = useState(null);
  const { restaurants, getRestaurants } = useRestaurantStore();
  const [selectedDays, setSelectedDays] = useState([]);

  const userRestaurantId = useAuthStore((s) => s.user?.restaurantId);
  const isResAdmin = useAuthStore((s) => s.user?.role === 'RES_ADMIN_ROLE');

  const effectiveRestaurantId = propRestaurantId || (isResAdmin ? userRestaurantId : null);
  const needsRestaurantSelector = !effectiveRestaurantId;

  useEffect(() => {
    if (!isOpen) return;
    if (menu) {
      reset({
        name: menu.name || '',
        description: menu.description || '',
        price: menu.price ?? '',
        category: menu.category || '',
        ingredients: menu.ingredients?.join(', ') || '',
        available: menu.available ?? true,
        'availability.days': menu.availability?.days || [],
        restaurantId: menu.restaurantId?._id || menu.restaurantId || '',
      });
      setSelectedDays(menu?.availability?.days || []);
      setPreview(menu.photo || null);
    } else {
      reset({
        name: '',
        description: '',
        price: '',
        category: '',
        ingredients: '',
        available: true,
        'availability.days': [],
      });
      setPreview(null);
      setSelectedDays([]);
    }
  }, [isOpen, menu, reset]);

  useEffect(() => {
    let objectUrl;
    const sub = watch((value, { name }) => {
      if (name === 'photo' && value.photo?.length > 0) {
        objectUrl = URL.createObjectURL(value.photo[0]);
        setPreview(objectUrl);
      }
    });
    return () => {
      sub.unsubscribe();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [watch]);

  useEffect(() => {
    if (needsRestaurantSelector) getRestaurants();
  }, [needsRestaurantSelector, getRestaurants]);

  if (!isOpen) return null;

  const submit = async (data) => {
    data['availability.days'] = selectedDays;
    data.restaurantId = effectiveRestaurantId || data.restaurantId;
    data.available = !!data.available;
    const ok = await onSave(data, menu?._id);
    if (ok) {
      reset();
      setPreview(null);
      onClose();
    }
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-3 sm:px-4'>
      <div className='w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-[#111118] border border-white/10 shadow-2xl'>
        <div
          className='p-4 sm:p-5 text-white sticky top-0 z-10'
          style={{ background: 'var(--dbe-gradient)' }}
        >
          <h2 className='text-xl sm:text-2xl font-bold'>{menu ? 'Editar plato' : 'Nuevo plato'}</h2>
          <p className='text-xs sm:text-sm opacity-80'>Completa la información del plato</p>
        </div>

        <form onSubmit={handleSubmit(submit)} className='p-4 sm:p-6 space-y-4 overflow-y-auto'>
          <div className='flex justify-center'>
            <div className='w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-white/20 bg-white/5'>
              {preview ? (
                <img src={preview} alt='preview' className='w-full h-full object-cover' />
              ) : (
                <span className='text-xs text-white/30'>Sin imagen</span>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='md:col-span-2'>
              <label className='dbe-label mb-1'>Nombre del plato</label>
              <input
                {...register('name', {
                  required: 'El nombre es obligatorio',
                  maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                })}
                className='dbe-input w-full px-3 py-2 text-sm'
                placeholder='Pizza Margherita'
              />
              {errors.name && <p className='dbe-error'>{errors.name.message}</p>}
            </div>

            <div className='md:col-span-2'>
              <label className='dbe-label mb-1'>Descripción</label>
              <textarea
                {...register('description', {
                  maxLength: { value: 255, message: 'Máximo 255 caracteres' },
                })}
                rows={2}
                className='dbe-input w-full px-3 py-2 text-sm resize-none'
              />
            </div>

            <div>
              <label className='dbe-label mb-1'>Precio</label>
              <input
                {...register('price', {
                  required: 'El precio es obligatorio',
                  min: { value: 0, message: 'No negativo' },
                })}
                type='number'
                step='0.01'
                className='dbe-input w-full px-3 py-2 text-sm'
              />
              {errors.price && <p className='dbe-error'>{errors.price.message}</p>}
            </div>

            <div>
              <label className='dbe-label mb-1'>Categoría</label>
              <select
                {...register('category', { required: 'La categoría es obligatoria' })}
                className='dbe-input w-full px-3 py-2 text-sm cursor-pointer'
                style={{ colorScheme: 'dark' }}
              >
                <option value='' className='bg-[#1a1a2e]'>Seleccione una categoría</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className='bg-[#1a1a2e]'>{c.label}</option>
                ))}
              </select>
              {errors.category && <p className='dbe-error'>{errors.category.message}</p>}
            </div>

            <div className='md:col-span-2'>
              <label className='dbe-label mb-1'>Ingredientes</label>
              <input
                {...register('ingredients')}
                className='dbe-input w-full px-3 py-2 text-sm'
                placeholder='queso, tomate...'
              />
            </div>

            {menu && (
              <div className='md:col-span-2 flex items-center gap-2'>
                <input
                  {...register('available')}
                  type='checkbox'
                  className='accent-pink-500'
                  defaultChecked={menu?.available ?? true}
                />
                <label className='text-sm text-white/70'>Plato disponible</label>
              </div>
            )}

            <div className='md:col-span-2'>
              <label className='dbe-label mb-2'>Días disponibles</label>
              <div className='flex gap-2 flex-wrap'>
                {DAYS.map((day) => (
                  <label key={day.value} className='flex flex-col items-center gap-1 cursor-pointer'>
                    <input
                      type='checkbox'
                      value={day.value}
                      checked={selectedDays.includes(day.value)}
                      onChange={() => toggleDay(day.value)}
                      className='sr-only peer'
                    />
                    <span className='w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold border border-white/10 bg-white/5 text-white/40 peer-checked:bg-pink-500/20 peer-checked:border-pink-500/50 peer-checked:text-pink-400 transition'>
                      {day.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className='md:col-span-2'>
              <label className='dbe-label mb-1'>Foto del plato</label>
              <input
                {...register('photo')}
                type='file'
                accept='image/*'
                className='w-full text-sm text-white file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer'
              />
            </div>

            {needsRestaurantSelector && (
              <div className='md:col-span-2'>
                <label className='dbe-label mb-1'>Restaurante</label>
                <select
                  {...register('restaurantId', { required: 'Selecciona un restaurante' })}
                  className='dbe-input w-full px-3 py-2 text-sm cursor-pointer'
                  style={{ colorScheme: 'dark' }}
                >
                  <option value='' className='bg-[#1a1a2e]'>Seleccione un restaurante</option>
                  {restaurants?.map((r) => (
                    <option key={r._id} value={r._id} className='bg-[#1a1a2e]'>{r.name}</option>
                  ))}
                </select>
                {errors.restaurantId && (
                  <p className='dbe-error'>{errors.restaurantId.message}</p>
                )}
              </div>
            )}
          </div>

          <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-white/10'>
            <button
              type='button'
              onClick={() => {
                reset();
                setPreview(null);
                onClose();
              }}
              className='px-4 py-2 rounded-lg text-sm bg-white/10 text-white/60 hover:bg-white/20 transition'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='dbe-btn-primary px-5 py-2 rounded-lg font-medium'
            >
              {loading ? <Spinner small /> : menu ? 'Guardar cambios' : 'Crear plato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};