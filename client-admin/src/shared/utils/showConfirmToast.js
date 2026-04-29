import toast from "react-hot-toast";

export const showConfirmToast = ({ title, message, onConfirm }) => {
    toast.custom((t) => (
        <div
            className="p-6 rounded-xl w-96 text-center shadow-2xl border"
            style={{
                background: '#16161f',
                borderColor: 'rgba(242,80,156,0.2)',
            }}
        >
            <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>{message}</p>
            <div className="flex justify-center gap-3">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="px-5 py-2 rounded-lg text-sm font-medium transition"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
                >
                    Cancelar
                </button>
                <button
                    onClick={() => {
                        onConfirm?.();
                        toast.dismiss(t.id);
                    }}
                    className="px-5 py-2 rounded-lg text-sm font-medium text-white transition"
                    style={{ background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)' }}
                >
                    Confirmar
                </button>
            </div>
        </div>
    ));
};
