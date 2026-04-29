import { useForm } from "react-hook-form";

export const CreateUserModal = ({ isOpen, onClose, onCreate, loading }) => {
    const {
        register,
        handleSubmit,
        getValues,
        reset,
        formState: { errors },
    } = useForm();

    if (!isOpen) return null;

    const submit = async (values) => {
        const payload = {
            firstName: values.firstName,
            surname: values.surname,
            username: values.username,
            email: values.email,
            password: values.password,
            role: values.role,
            phone: values.phone || undefined,
        };

        const ok = await onCreate(payload);
        if (ok) {
            reset();
            onClose();
        }
    };

    const inputClass = "w-full px-3 py-2 rounded-lg text-sm outline-none transition";
    const inputStyle = {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
    };
    const labelClass = "block text-xs font-semibold mb-1";
    const labelStyle = { color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase' };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4"
            style={{ background: 'rgba(11,11,13,0.85)', backdropFilter: 'blur(6px)' }}
        >
            <div
                className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
                style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)' }}
            >
                <div
                    className="p-5 text-white"
                    style={{ background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)' }}
                >
                    <h2 className="text-xl font-bold">Nuevo Usuario</h2>
                    <p className="text-xs opacity-75 mt-0.5">Completa la información para registrar un nuevo usuario</p>
                </div>

                <form onSubmit={handleSubmit(submit)} className="p-5 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Nombre</label>
                            <input
                                type="text"
                                className={inputClass}
                                style={inputStyle}
                                {...register("firstName", { required: "El nombre es obligatorio" })}
                            />
                            {errors.firstName && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Apellido</label>
                            <input
                                type="text"
                                className={inputClass}
                                style={inputStyle}
                                {...register("surname", { required: "El apellido es obligatorio" })}
                            />
                            {errors.surname && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.surname.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Nombre de usuario</label>
                            <input
                                type="text"
                                className={inputClass}
                                style={inputStyle}
                                {...register("username", {
                                    required: "El username es obligatorio",
                                    minLength: { value: 3, message: "Mínimo 3 caracteres" }
                                })}
                            />
                            {errors.username && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.username.message}</p>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Teléfono</label>
                            <input
                                type="tel"
                                className={inputClass}
                                style={inputStyle}
                                {...register("phone")}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass} style={labelStyle}>Correo electrónico</label>
                        <input
                            type="email"
                            className={inputClass}
                            style={inputStyle}
                            {...register("email", {
                                required: "El correo es obligatorio",
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Formato inválido" }
                            })}
                        />
                        {errors.email && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className={labelClass} style={labelStyle}>Rol</label>
                        <select
                            className={inputClass}
                            style={{ ...inputStyle, cursor: 'pointer' }}
                            {...register("role", { required: "El rol es obligatorio" })}
                        >
                            <option value="">Seleccione un rol</option>
                            <option value="ADMIN_ROLE" style={{ background: '#1a1a2e' }}>ADMIN_ROLE</option>
                            <option value="RES_ADMIN_ROLE" style={{ background: '#1a1a2e' }}>RES_ADMIN_ROLE</option>
                            <option value="USER_ROLE" style={{ background: '#1a1a2e' }}>USER_ROLE</option>
                        </select>
                        {errors.role && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.role.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Contraseña</label>
                            <input
                                type="password"
                                className={inputClass}
                                style={inputStyle}
                                {...register("password", {
                                    required: "La contraseña es obligatoria",
                                    minLength: { value: 8, message: "Mínimo 8 caracteres" }
                                })}
                            />
                            {errors.password && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.password.message}</p>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Confirmar contraseña</label>
                            <input
                                type="password"
                                className={inputClass}
                                style={inputStyle}
                                {...register("confirmPassword", {
                                    required: "Confirma la contraseña",
                                    validate: (v) => v === getValues("password") || "Las contraseñas no coinciden"
                                })}
                            />
                            {errors.confirmPassword && <p className="text-xs mt-0.5" style={{ color: '#F2509C' }}>{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <button
                            type="button"
                            onClick={() => { reset(); onClose(); }}
                            className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-medium transition"
                            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition"
                            style={{ background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)', opacity: loading ? 0.6 : 1 }}
                        >
                            {loading ? 'Creando...' : 'Crear usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
