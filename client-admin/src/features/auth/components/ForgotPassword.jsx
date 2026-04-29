import { useForm } from "react-hook-form"
import { forgotPassword } from "../../../shared/apis/auth.js";
import { showSuccess, showError } from "../../../shared/utils/toast.js";

export const ForgotPassword = ({ onSwitch }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async ({ email }) => {
        try {
            await forgotPassword(email);
            showSuccess('Revisa tu correo para restablecer la contraseña');
            onSwitch();
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || 'Error al procesar la solicitud';
            showError(message);
        }
    };

    const inputStyle = {
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#fff',
        borderRadius: '8px',
    };

    const labelStyle = {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.7rem',
        fontWeight: '600',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6">
            <div>
                <label htmlFor="email" style={labelStyle} className="block mb-1.5">
                    Correo electrónico
                </label>
                <input
                    type="email"
                    id="email"
                    placeholder="usuario@email.com"
                    className="w-full px-3 py-2.5 text-sm outline-none transition"
                    style={inputStyle}
                    {...register("email", {
                        required: "El correo es obligatorio",
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Correo inválido" }
                    })}
                />
                {errors.email && (
                    <p className="text-xs mt-1" style={{ color: '#F2509C' }}>{errors.email.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-sm font-semibold text-white rounded-lg transition"
                style={{ background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)' }}
            >
                {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
            </button>

            <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <button
                    type="button"
                    onClick={onSwitch}
                    className="transition hover:opacity-80"
                    style={{ color: '#C35BB9' }}
                >
                    Volver al inicio de sesión
                </button>
            </p>
        </form>
    );
};
