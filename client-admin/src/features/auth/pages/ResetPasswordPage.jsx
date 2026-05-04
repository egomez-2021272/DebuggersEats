import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../../shared/apis/auth.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';
import logoImg from '../../../assets/img/DebuggersEats_logo.png';

const GRADIENT = 'linear-gradient(135deg, #F2509C 0%, #C35BB9 50%, #9362D9 100%)';

const inputStyle = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#fff',
  borderRadius: '8px',
};

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ newPassword }) => {
    try {
      await resetPassword(token, newPassword);
      showSuccess('Contraseña restablecida correctamente');
      navigate('/');
    } catch (err) {
      showError(
        err.response?.data?.error || err.response?.data?.message || 'Token inválido o expirado'
      );
    }
  };

  const fields = [
    {
      name: 'newPassword',
      label: 'Nueva contraseña',
      rules: {
        required: 'La contraseña es obligatoria',
        minLength: { value: 8, message: 'Mínimo 8 caracteres' },
      },
    },
    {
      name: 'confirmPassword',
      label: 'Confirmar contraseña',
      rules: {
        required: 'Confirma tu contraseña',
        validate: (v) => v === getValues('newPassword') || 'Las contraseñas no coinciden',
      },
    },
  ];

  return (
    <div
      className='min-h-screen flex items-center justify-center p-4'
      style={{ background: '#0B0B0D' }}
    >
      <div
        className='w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl'
        style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className='flex flex-col items-center justify-center py-8 px-6'
          style={{ background: GRADIENT }}
        >
          <div
            className='w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-lg'
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <img src={logoImg} alt='DebuggersEats' className='w-9 h-9 object-contain' />
          </div>
          <h1 className='text-white font-bold text-xl'>Nueva contraseña</h1>
          <p className='text-white text-xs mt-0.5' style={{ opacity: 0.75 }}>
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 px-6 py-6'>
          {fields.map(({ name, label, rules }) => (
            <div key={name}>
              <label
                className='block mb-1.5'
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </label>
              <input
                type='password'
                placeholder='••••••••'
                className='w-full px-3 py-2.5 text-sm outline-none'
                style={inputStyle}
                {...register(name, rules)}
              />
              {errors[name] && (
                <p className='text-xs mt-1' style={{ color: '#F2509C' }}>
                  {errors[name].message}
                </p>
              )}
            </div>
          ))}

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full py-2.5 text-sm font-semibold text-white rounded-lg transition'
            style={{ background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)' }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
          </button>

          <button
            type='button'
            onClick={() => navigate('/')}
            className='w-full text-center text-xs transition'
            style={{ color: '#C35BB9' }}
          >
            Volver al inicio
          </button>
        </form>
      </div>
    </div>
  );
};
