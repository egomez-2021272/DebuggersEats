import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../../auth/store/authStore.js";
import { useRestaurantStore } from "../../restaurants/store/restaurantStore.js";
import { Spinner } from "../../auth/components/Spinner.jsx";
import { EditProfileModal } from "../components/EditProfileModal.jsx";
import { ReviewModal } from "../../review/components/ReviewModal.jsx";
import { updateProfile } from "../../../shared/apis/auth.js";
import { showSuccess, showError } from "../../../shared/utils/toast.js";

const NAV_ITEMS = [
    { label: 'Inicio', path: '/home' },
    { label: 'Restaurantes', path: '/home/restaurantes' },
    { label: 'Eventos', path: '/home/eventos' },
    { label: 'Mis Reservaciones', path: '/home/reservaciones' },
    { label: 'Mis Órdenes', path: '/home/ordenes' },
    { label: 'Mis Reseñas', path: '/home/resenas' },
];

export const UserPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const { restaurants, loading, getRestaurants } = useRestaurantStore();
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);

    useEffect(() => { getRestaurants(); }, []);

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

    const isActive = (path) => {
        if (path === '/home') return location.pathname === '/home';
        return location.pathname.startsWith(path);
    };

    if (loading && restaurants.length === 0) return <Spinner />;

    return (
        <div className="min-h-screen text-white" style={{ background: 'var(--dbe-black)', fontFamily: 'inherit' }}>
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6"
                style={{ height: 56, background: '#111118', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[17px] font-bold" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>
                    Debuggers<span style={{ color: 'var(--dbe-pink)' }}>Eats</span>
                </span>

                <div className="flex gap-1">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-all"
                            style={{
                                background: isActive(item.path) ? 'rgba(242,80,156,0.12)' : 'transparent',
                                color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="px-3.5 py-1.5 rounded-lg text-[13px] font-semibold cursor-pointer"
                        style={{ border: '1px solid rgba(242,80,156,0.3)', background: 'rgba(242,80,156,0.08)', color: 'var(--dbe-pink)' }}>
                        Carrito
                    </div>
                    <AvatarMenu initials={initials} user={user} onEditProfile={() => setEditProfileOpen(true)} onLogout={handleLogout} />
                </div>
            </nav>

            <div className="px-6 pt-8">
                <Outlet context={{ restaurants, user, setReviewModalOpen }} />
            </div>

            <EditProfileModal
                isOpen={editProfileOpen}
                onClose={() => setEditProfileOpen(false)}
                onSave={handleSaveProfile}
                user={user}
                loading={savingProfile}
            />

            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
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
                <div className="animate-fadeIn absolute right-0 overflow-hidden"
                    style={{ top: 'calc(100% + 8px)', width: 200, borderRadius: 14, background: '#16161f', border: '1px solid rgba(242,80,156,0.15)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 200 }}>
                    <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="font-bold text-[13px] text-white m-0">{user?.firstName} {user?.surname}</p>
                        <p className="text-[11px] mt-0.5 m-0" style={{ color: 'rgba(255,255,255,0.35)' }}>@{user?.username}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: 'rgba(242,80,156,0.15)', color: 'var(--dbe-pink)' }}>
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