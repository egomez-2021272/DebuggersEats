import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../auth/store/authStore.js";
import { useRestaurantStore } from "../../restaurants/store/restaurantStore.js";
import { Spinner } from "../../auth/components/Spinner.jsx";
import { EditProfileModal } from "../components/EditProfileModal.jsx";
import { updateProfile } from "../../../shared/apis/auth.js";
import { showSuccess, showError } from "../../../shared/utils/toast.js";
import { Restaurants } from "../../restaurants/components/Restaurants.jsx";

const CATEGORY_LABELS = {
    COMIDA_RAPIDA: 'Comida Rápida',
    ITALIANA: 'Italiana',
    CHINA: 'China',
    MEXICANA: 'Mexicana',
    CAFETERIA: 'Cafetería',
};

const NAV_ITEMS = ['Inicio', 'Restaurantes', 'Eventos', 'Mis Reservaciones', 'Mis Órdenes'];

const QUICK_ACCESS = [
    { title: 'Nueva Reservación', sub: 'Reserva tu mesa ahora', nav: null },
    { title: 'Ordenar al Instante', sub: 'Ver menús disponibles', nav: 'Restaurantes' },
    { title: 'Eventos Gastronómicos', sub: 'Noches especiales', nav: null },
    { title: 'Dejar Comentario', sub: 'Califica tu experiencia', nav: null },
];

const isRestaurantOpen = (r) => {
    if (!r.businessHours?.open || !r.businessHours?.close) return null;
    const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const cur = new Date().getHours() * 60 + new Date().getMinutes();
    return cur >= toMin(r.businessHours.open) && cur <= toMin(r.businessHours.close);
};

export const UserPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { restaurants, loading, getRestaurants } = useRestaurantStore();
    const [activeNav, setActiveNav] = useState('Inicio');
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const location = useLocation();
    const isMenuRoute = location.pathname.includes("/restaurantes/");
    useEffect(() => { getRestaurants(); }, [getRestaurants]);

    const handleLogout = () => { logout(); navigate('/'); };

    const handleSaveProfile = async (data) => {
        try {
            setSavingProfile(true);
            const { data: { data: updatedUser } } = await updateProfile(data);
            useAuthStore.setState((s) => ({ user: { ...s.user, ...updatedUser } }));
            showSuccess('Perfil actualizado correctamente');
            return true;
        } catch (err) {
            showError(err.response?.data?.error || err.response?.data?.message || 'Error al actualizar el perfil');
            return false;
        } finally {
            setSavingProfile(false);
        }
    };

    const initials = user
        ? `${user.firstName?.[0] ?? ''}${user.surname?.[0] ?? ''}`.toUpperCase()
        : 'U';

    const filtered = restaurants.filter((r) => {
        const matchCat = activeFilter === 'ALL' || r.category === activeFilter;
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    if (loading && restaurants.length === 0) return <Spinner />;

    return (
        <div className="min-h-screen text-white" style={{ background: 'var(--dbe-black)', fontFamily: 'inherit' }}>
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6" style={{ height: 56, background: '#111118', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[17px] font-bold">
                    Debuggers<span style={{ color: 'var(--dbe-pink)' }}>Eats</span>
                </span>

                <div className="flex gap-1">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item}
                            onClick={() => {
                                setActiveNav(item);
                                const routes = {
                                    'Inicio': '/home',
                                    'Restaurantes': '/home',
                                };
                                if (routes[item]) {
                                    navigate(routes[item]);
                                }
                            }}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="px-3.5 py-1.5 rounded-lg text-[13px] font-semibold cursor-pointer" style={{ border: '1px solid rgba(242,80,156,0.3)', background: 'rgba(242,80,156,0.08)', color: 'var(--dbe-pink)' }}>
                        Carrito
                    </div>
                    <AvatarMenu initials={initials} user={user} onEditProfile={() => setEditProfileOpen(true)} onLogout={handleLogout} />
                </div>
            </nav>

            <div className="px-6 pt-8">
                {isMenuRoute ? (
                    <Outlet />)
                    : activeNav === 'Restaurantes' ? (
                        <Restaurants />
                    ) : (
                        <>
                            <p className="text-[13px] mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                Hola, {user?.firstName} {user?.surname}
                            </p>
                            <h1 className="text-[28px] font-extrabold mb-5">
                                Que vas a <span style={{ color: 'var(--dbe-pink)' }}>ordenar hoy?</span>
                            </h1>

                            <div className="flex items-center gap-2.5 max-w-[480px] mb-7 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Busca restaurante, plato o evento..."
                                    className="bg-transparent border-none outline-none text-white text-[13px] flex-1"
                                />
                            </div>

                            <div className="flex gap-3 mb-7">
                                {[
                                    { num: restaurants.length, label: 'Restaurantes' },
                                    { num: 0, label: 'Eventos activos' },
                                    { num: 0, label: 'Mis reservaciones' },
                                ].map(({ num, label }) => (
                                    <div key={label} className="flex-1 rounded-xl px-[18px] py-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <div className="text-[22px] font-extrabold">{num}</div>
                                        <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[12px] font-bold uppercase tracking-[0.07em] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Acceso rapido
                            </p>
                            <div className="grid grid-cols-4 gap-2.5 mb-8">
                                {QUICK_ACCESS.map(({ title, sub, nav }) => (
                                    <HoverCard key={title} onClick={nav ? () => setActiveNav(nav) : undefined}>
                                        <div className="text-[13px] font-semibold mb-0.5">{title}</div>
                                        <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</div>
                                    </HoverCard>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mb-3.5">
                                <p className="text-[12px] font-bold uppercase tracking-[0.07em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                    Restaurantes disponibles
                                </p>
                                <span
                                    className="text-[13px] font-medium cursor-pointer"
                                    style={{ color: 'var(--dbe-pink)' }}
                                    onClick={() => setActiveNav('Restaurantes')}
                                >
                                    Ver todos
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {['ALL', ...Object.keys(CATEGORY_LABELS)].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveFilter(cat)}
                                        className="px-3.5 py-1 rounded-full text-[12px] font-semibold cursor-pointer border-none transition-all"
                                        style={{
                                            background: activeFilter === cat ? 'var(--dbe-gradient-h)' : 'transparent',
                                            color: activeFilter === cat ? '#fff' : 'rgba(255,255,255,0.5)',
                                            outline: activeFilter === cat ? 'none' : '1px solid rgba(255,255,255,0.12)',
                                        }}
                                    >
                                        {cat === 'ALL' ? 'Todos' : CATEGORY_LABELS[cat]}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col gap-2 pb-12">
                                {filtered.length === 0 ? (
                                    <div className="text-center py-12 text-[14px] rounded-xl" style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                        No se encontraron restaurantes
                                    </div>
                                ) : filtered.map((r) => {
                                    const open = isRestaurantOpen(r);
                                    return (
                                        <HoverCard key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                                {r.photo
                                                    ? <img src={r.photo} alt={r.name} className="w-full h-full object-cover" />
                                                    : <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
                                                }
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[14px] font-bold mb-0.5">{r.name}</div>
                                                <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                    {CATEGORY_LABELS[r.category] || r.category}
                                                </div>
                                            </div>
                                            {open !== null && (
                                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{
                                                    background: open ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)',
                                                    color: open ? '#4ade80' : '#f87171',
                                                }}>
                                                    {open ? 'Abierto' : 'Cerrado'}
                                                </span>
                                            )}
                                        </HoverCard>
                                    );
                                })}
                            </div>
                        </>
                    )}
            </div>

            <EditProfileModal
                isOpen={editProfileOpen}
                onClose={() => setEditProfileOpen(false)}
                onSave={handleSaveProfile}
                user={user}
                loading={savingProfile}
            />
        </div>
    );
};

const HoverCard = ({ children, style = {}, onClick }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
            style={{
                background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${hovered ? 'rgba(242,80,156,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.15s',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

const MENU_ACTIONS = [
    { label: 'Editar perfil', colorVar: 'rgba(255,255,255,0.6)', hoverBg: 'rgba(255,255,255,0.05)', action: 'edit' },
    { label: 'Cerrar sesión', colorVar: 'var(--dbe-pink)', hoverBg: 'rgba(242,80,156,0.1)', action: 'logout' },
];

const AvatarMenu = ({ initials, user, onEditProfile, onLogout }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handler = (e) => { if (!e.target.closest('[data-avatar-menu]')) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleAction = (action) => {
        setOpen(false);
        if (action === 'edit') onEditProfile();
        if (action === 'logout') onLogout();
    };

    return (
        <div data-avatar-menu style={{ position: 'relative' }}>
            <div
                onClick={() => setOpen((p) => !p)}
                title={user?.username}
                className="flex items-center justify-center rounded-full text-[13px] font-bold cursor-pointer transition-all"
                style={{
                    width: 34, height: 34,
                    background: 'var(--dbe-gradient)',
                    border: open ? '2px solid rgba(242,80,156,0.6)' : '2px solid transparent',
                }}
            >
                {initials}
            </div>

            {open && (
                <div className="animate-fadeIn absolute right-0 overflow-hidden" style={{ top: 'calc(100% + 8px)', width: 200, borderRadius: 14, background: '#16161f', border: '1px solid rgba(242,80,156,0.15)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 200 }}>
                    <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="font-bold text-[13px] text-white m-0">
                            {user?.firstName} {user?.surname}
                        </p>
                        <p className="text-[11px] mt-0.5 m-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            @{user?.username}
                        </p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(242,80,156,0.15)', color: 'var(--dbe-pink)' }}>
                            Usuario
                        </span>
                    </div>
                    <div className="p-1.5">
                        {MENU_ACTIONS.map(({ label, colorVar, hoverBg, action }) => (
                            <MenuBtn key={action} onClick={() => handleAction(action)} color={colorVar} hoverBg={hoverBg}>
                                {label}
                            </MenuBtn>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const MenuBtn = ({ children, onClick, color, hoverBg }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="block w-full text-left rounded-[9px] text-[13px] font-semibold border-none cursor-pointer transition-all"
            style={{ padding: '9px 12px', color, background: hovered ? hoverBg : 'transparent' }}
        >
            {children}
        </button>
    );
};