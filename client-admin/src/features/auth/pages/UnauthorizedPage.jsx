import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <div
      className='min-h-screen flex flex-col items-center justify-center gap-4'
      style={{ background: '#0B0B0D', color: '#fff' }}
    >
      <div className='text-center'>
        <h2 className='text-2xl font-bold mb-2' style={{ color: '#F2509C' }}>
          Acceso denegado
        </h2>
        <p className='text-sm' style={{ color: 'rgba(255,255,255,0.5)' }}>
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className='px-5 py-2 text-sm font-semibold text-white rounded-lg'
        style={{ background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)' }}
      >
        Volver
      </button>
    </div>
  );
};
