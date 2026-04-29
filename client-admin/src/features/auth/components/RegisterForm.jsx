import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore.js";
import { showSuccess, showError } from "../../../shared/utils/toast.js";

export const RegisterForm = ({ onSwitch }) => {
    const register_user = useAuthStore((state) => state.register);
    const loading = useAuthStore((state) => state.loading);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        const payload = {
            firstName: data.firstName,
            surname: data.surname,
            email: data.email,
            username: data.username,
            password: data.password,
            phone: data.phone || undefined,
        };

        const res = await register_user(payload);
        if (res.success) {
            showSuccess('Cuenta creada. Revisa tu correo para activarla.');
            onSwitch();
        } else {
            showError(res.error || 'Error al crear la cuenta');
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 px-6 pb-6">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label style={labelStyle} className="block mb-1">Nombre</label>
                    <input
                        type="text"
                        placeholder="Juan"
                        className="w-full px-3 py-2 text-sm outline-none transition"
                        style={inputStyle}
                        {...register("firstName", { required: "Obligatorio" })}
                    />
                    {errors.firstName && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.firstName.message}</p>}
                </div>
                <div>
                    <label style={labelStyle} className="block mb-1">Apellido</label>
                    <input
                        type="text"
                        placeholder="Pérez"
                        className="w-full px-3 py-2 text-sm outline-none transition"
                        style={inputStyle}
                        {...register("surname", { required: "Obligatorio" })}
                    />
                    {errors.surname && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.surname.message}</p>}
                </div>
            </div>

            <div>
                <label style={labelStyle} className="block mb-1">Correo electrónico</label>
                <input
                    type="email"
                    placeholder="usuario@email.com"
                    className="w-full px-3 py-2 text-sm outline-none transition"
                    style={inputStyle}
                    {...register("email", {
                        required: "El correo es obligatorio",
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Correo inválido" }
                    })}
                />
                {errors.email && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label style={labelStyle} className="block mb-1">Usuario</label>
                    <input
                        type="text"
                        placeholder="juanperez"
                        className="w-full px-3 py-2 text-sm outline-none transition"
                        style={inputStyle}
                        {...register("username", {
                            required: "Obligatorio",
                            minLength: { value: 3, message: "Min. 3 caracteres" }
                        })}
                    />
                    {errors.username && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.username.message}</p>}
                </div>
                <div>
                    <label style={labelStyle} className="block mb-1">Teléfono</label>
                    <input
                        type="tel"
                        placeholder="42459699"
                        className="w-full px-3 py-2 text-sm outline-none transition"
                        style={inputStyle}
                        {...register("phone")}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label style={labelStyle} className="block mb-1">Contraseña</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-sm outline-none transition"
                        style={inputStyle}
                        {...register("password", {
                            required: "Obligatorio",
                            minLength: { value: 8, message: "Min. 8 caracteres" }
                        })}
                    />
                    {errors.password && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.password.message}</p>}
                </div>
                <div>
                    <label style={labelStyle} className="block mb-1">Confirmar</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-sm outline-none transition"
                        style={inputStyle}
                        {...register("confirmPassword", {
                            required: "Obligatorio",
                            validate: (v) => v === getValues("password") || "No coincide"
                        })}
                    />
                    {errors.confirmPassword && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.confirmPassword.message}</p>}
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold text-white rounded-lg transition mt-1"
                style={{ background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)' }}
            >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                ¿Ya tienes cuenta?{' '}
                <button
                    type="button"
                    onClick={onSwitch}
                    className="transition hover:opacity-80"
                    style={{ color: '#C35BB9' }}
                >
                    Iniciar sesión
                </button>
            </p>
        </form>
    );
};