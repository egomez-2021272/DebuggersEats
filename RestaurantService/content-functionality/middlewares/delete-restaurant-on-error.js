import { cloudinary } from './restaurant-uploader'; 


export const cleanupUploadedFileOnFinish = (req, res, next) => {
    if (req.file) {
        res.on('finish', async () => {
            try {
                if (res.statusCode >= 400) {
                    const publicId = req.file.public_id || req.file.filename;
                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId);
                        console.log(`♻️ Menú App | Foto eliminada (Status ${res.statusCode}): ${publicId}`);
                    }
                }
            } catch (err) {
                console.error(`❌ Menú App | Error en limpieza post-respuesta: ${err.message}`);
            }
        });
    }
    next();
};


export const deleteFileOnError = async (err, req, res, next) => {
    try {
        if (req.file) {
            const publicId = req.file.public_id || req.file.filename;
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
                console.log(`♻️ Menú App | Foto eliminada por error en proceso: ${publicId}`);
            }
        }
    } catch (e) {
        console.error(`Menú App | Error al borrar archivo tras excepción: ${e.message}`);
    }
    return next(err);
};