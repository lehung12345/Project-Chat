/**
 * Middleware kiểm tra quyền Admin
 * Phải được đặt SAU authMiddleware trong file routes
 */
exports.isAdmin = (req, res, next) => {
    // req.user đã được authMiddleware cung cấp trước đó
    if (req.user && req.user.role === 'admin') {
        next(); // Nếu là admin, cho phép tiếp tục
    } else {
        // Nếu không phải admin, trả về lỗi 403 (Forbidden)
        return res.status(403).json({ 
            message: 'Truy cập bị từ chối: Bạn không có quyền Admin để thực hiện hành động này.' 
        });
    }
};

/**
 * (Mở rộng) Middleware kiểm tra nhiều quyền nếu cần sau này
 */
exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
        }
        next();
    };
};