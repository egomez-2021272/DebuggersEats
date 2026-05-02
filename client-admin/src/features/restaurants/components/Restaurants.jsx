import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurantStore } from "../store/restaurantStore";
import { Spinner } from "../../auth/components/Spinner.jsx";
import { RestaurantModal } from "./RestaurantModal.jsx";
import { useUIStore } from "../../auth/store/uiStore.js";
import { showError } from "../../../shared/utils/toast.js";
import { useAuthStore } from "../../auth/store/authStore.js";
import { useSaveRestaurant } from "../hooks/useSaveRestaurant.js";

const CATEGORY_LABELS = {
    COMIDA_RAPIDA: 'Comida Rápida',
    ITALIANA: 'Italiana',
    CHINA: 'China',
    MEXICANA: 'Mexicana',
    CAFETERIA: 'Cafetería',
};

const CATEGORY_COLORS = {
    COMIDA_RAPIDA: { bg: 'rgba(249,115,22,0.15)', color: '#fb923c' },
    ITALIANA: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
    CHINA: { bg: 'rgba(234,179,8,0.15)', color: '#fbbf24' },
    MEXICANA: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
    CAFETERIA: { bg: 'rgba(147,98,217,0.15)', color: '#a78bfa' },
};

const dim = { color: 'rgba(255,255,255,0.5)' };
const dimmer = { color: 'rgba(255,255,255,0.3)' };
const pill = { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' };

export const Restaurants = () => {
    const navigate = useNavigate();
    const { restaurants, loading, error, getRestaurants, deleteRestaurant } = useRestaurantStore();
    const { saveRestaurant } = useSaveRestaurant();
    const [openModal, setOpenModal] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [saving, setSaving] = useState(false);
    const { openConfirm } = useUIStore();
    const role = useAuthStore((s) => s.user?.role);
    const isAdmin = role === 'ADMIN_ROLE';

    useEffect(() => { getRestaurants(); }, []);
    useEffect(() => { if (error) showError(error); }, [error]);

    const handleSave = async (formData, restaurantId) => {
        setSaving(true);
        const ok = await saveRestaurant(formData, restaurantId);
        setSaving(false);
        return ok;
    };

    if (loading && restaurants.length === 0 && !openModal) return <Spinner />;

    const filtered = restaurants.filter((r) => {
        const matchesCategory = filterCategory === 'ALL' || r.category === filterCategory;
        const q = search.trim().toLowerCase();
        return matchesCategory && (!q || r.name?.toLowerCase().includes(q) || r.address?.toLowerCase().includes(q));
    });

    const handleEdit = (restaurant) => { setSelectedRestaurant(restaurant); setOpenModal(true); };
    const handleClose = () => { setOpenModal(false); setSelectedRestaurant(null); };

    return (
        <div className="p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Restaurantes</h1>
                    <p className="text-sm" style={dim}>
                        {restaurants.length} restaurante{restaurants.length !== 1 ? 's' : ''} registrado{restaurants.length !== 1 ? 's' : ''}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
                        style={{ background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)' }}
                        onClick={() => handleEdit(null)}
                    >
                        + Nuevo restaurante
                    </button>
                )}
            </div>

            <div className="rounded-xl p-4 mb-4" style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o dirección..."
                        className="md:col-span-2 w-full px-3 py-2 rounded-lg outline-none text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg outline-none text-sm"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
                    >
                        <option value="ALL" style={{ background: '#1a1a2e' }}>Todas las categorías</option>
                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                            <option key={value} value={value} style={{ background: '#1a1a2e' }}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-xl p-6 text-center text-sm" style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)', ...dimmer }}>
                    No hay restaurantes para mostrar.
                </div>
            ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((restaurant) => {
                        const catStyle = CATEGORY_COLORS[restaurant.category] || { bg: 'rgba(255,255,255,0.1)', color: '#fff' };
                        const isExpanded = expandedId === restaurant._id;
                        return (
                            <div
                                key={restaurant._id}
                                className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                                style={{ background: '#16161f', border: `1px solid ${isExpanded ? 'rgba(242,80,156,0.3)' : 'rgba(255,255,255,0.07)'}`, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                                onClick={() => setExpandedId(isExpanded ? null : restaurant._id)}
                            >
                                <div className="w-full h-44 flex items-center justify-center overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    {restaurant.photo
                                        ? <img src={restaurant.photo} alt={restaurant.name} className="w-full h-full object-cover" />
                                        : <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Sin imagen</span>
                                    }
                                </div>

                                <div className="p-4 flex flex-col flex-1 gap-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <h2 className="text-base font-bold text-white leading-tight">{restaurant.name}</h2>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0" style={{ background: catStyle.bg, color: catStyle.color }}>
                                            {CATEGORY_LABELS[restaurant.category] || restaurant.category}
                                        </span>
                                    </div>

                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{restaurant.address}</p>

                                    <div className="flex gap-2 flex-wrap mt-1">
                                        <span className="px-2 py-0.5 rounded-full text-xs" style={pill}>{restaurant.capacity} personas</span>
                                        {restaurant.businessHours?.open && (
                                            <span className="px-2 py-0.5 rounded-full text-xs" style={pill}>
                                                {restaurant.businessHours.open} - {restaurant.businessHours.close}
                                            </span>
                                        )}
                                    </div>

                                    {restaurant.contactInfo?.managerName && (
                                        <p className="text-xs" style={dimmer}>Encargado: {restaurant.contactInfo.managerName}</p>
                                    )}

                                    {isExpanded && (
                                        <div className="mt-2 space-y-1.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                            {restaurant.phone && <p className="text-xs" style={dim}>Número Telefónico: {restaurant.phone}</p>}
                                            {restaurant.contactInfo?.email && <p className="text-xs" style={dim}>Correo: {restaurant.contactInfo.email}</p>}
                                        </div>
                                    )}

                                    <button
                                        className="flex-1 py-1.5 rounded-lg text-sm font-medium transition bg-white/[0.06] hover:bg-white/10 text-white/70"
                                        onClick={(e) => {
                                            e.stopPropagation(); if (role === "USER_ROLE") {
                                                navigate(`/home/restaurantes/${restaurant._id}/menu`);
                                            } else {
                                                navigate(`/dashboard/restaurantes/${restaurant._id}/menu`);
                                            }
                                        }}
                                    >
                                        Ver menú
                                    </button>
                                    
                                    {isAdmin && (
                                        <div className="flex gap-2 mt-auto pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <button
                                                className="flex-1 py-1.5 rounded-lg text-sm font-medium transition"
                                                style={{ background: 'rgba(242,80,156,0.15)', border: '1px solid rgba(242,80,156,0.3)', color: 'var(--dbe-pink)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(242,80,156,0.25)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(242,80,156,0.15)'}
                                                onClick={(e) => { e.stopPropagation(); handleEdit(restaurant); }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="flex-1 py-1.5 rounded-lg text-sm font-medium transition"
                                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openConfirm({
                                                        title: 'Eliminar restaurante',
                                                        message: `¿Eliminar "${restaurant.name}"? Esta acción no se puede deshacer.`,
                                                        onConfirm: () => deleteRestaurant(restaurant._id)
                                                    });
                                                }}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <RestaurantModal
                isOpen={openModal}
                onClose={handleClose}
                restaurant={selectedRestaurant}
                onSave={handleSave}
                loading={saving}
                error={error}
            />
        </div>
    );
};