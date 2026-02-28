import Menu from './menu.model.js';
import { uploadImage, deleteImage, getFullImageUrl } from '../../helpers/cloudinary-service.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const MENU_FOLDER = process.env.CLOUDINARY_MENU_FOLDER || 'menu';

export const createMenuService = async (data, file) => {
    const menu = new Menu(data);
    await menu.save();

    // Si viene foto, subirla a Cloudinary
    if (file) {
        const fileName = `menu-${uuidv4()}${path.extname(file.originalname)}`;
        await uploadImage(file.path, fileName, MENU_FOLDER);
        menu.photo = fileName;
        await menu.save();
    }

    return {
        ...menu.toObject(),
        photoUrl: menu.photo ? getFullImageUrl(menu.photo, MENU_FOLDER) : null
    };
};

export const getMenusService = async () => {
    return await Menu.find();
};

export const getMenuByIdService = async (id) => {
    const menu = await Menu.findById(id);
    if (!menu) throw new Error('Menu no encontrado');
    return menu;
};

export const updateMenuService = async (id, data) => {
    const menu = await Menu.findByIdAndUpdate(id, data, { new: true });
    if (!menu) throw new Error('Menu no encontrado');
    return menu;
};

export const deleteMenuService = async (id) => {
    const menu = await Menu.findByIdAndDelete(id);
    if (!menu) throw new Error('Menu no encontrado');
    return menu;
};

export const uploadMenuPhotoService = async ({ menuId, file }) => {
    const menu = await Menu.findById(menuId);
    if (!menu) throw new Error('Menu no encontrado');

    // Eliminar foto anterior en Cloudinary si existe
    if (menu.photo) {
        await deleteImage(menu.photo, MENU_FOLDER);
    }

    const fileName = `menu-${uuidv4()}${path.extname(file.originalname)}`;
    await uploadImage(file.path, fileName, MENU_FOLDER);

    menu.photo = fileName;
    await menu.save();

    return {
        ...menu.toObject(),
        photoUrl: getFullImageUrl(fileName, MENU_FOLDER)
    };
};

export const deleteMenuPhotoService = async (menuId) => {
    const menu = await Menu.findById(menuId);
    if (!menu) throw new Error('Menu no encontrado');

    if (menu.photo) {
        await deleteImage(menu.photo, MENU_FOLDER);
        menu.photo = null;
        await menu.save();
    }

    return menu;
};
