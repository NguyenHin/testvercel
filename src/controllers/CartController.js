const Product = require('../models/Product');

class CartController {
    static getCartCookieName(req, res) {
        return res.locals.user ? `cart_${res.locals.user.id}` : 'cart_guest';
    }

    static viewCart(req, res) {
        const cart = req.cart || [];
        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        res.render('cart', {
            cart: cart,
            totalAmount: totalAmount,
            error: req.query.error
        });
    }

    static async addToCart(req, res) {
        const productId = req.params.id;
        const quantity = Number(req.body.quantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ success: false, message: "Số lượng phải là số nguyên dương lớn hơn 0" });
        }

        try {
            const product = await Product.getProductById(productId);
            if (!product) return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });

            if (product.quantity < quantity) {
                return res.status(400).json({ success: false, message: "Sản phẩm không đủ hàng" });
            }

            let cart = req.cart || [];
            const existingItem = cart.find(item => item.id == productId);

            if (existingItem) {
                if (product.quantity < existingItem.quantity + quantity) {
                    return res.status(400).json({ success: false, message: "Sản phẩm không đủ hàng" });
                }
                existingItem.quantity += quantity;
            } else {
                cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: quantity });
            }

            const cookieName = CartController.getCartCookieName(req, res);
            res.cookie(cookieName, JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 });

            const totalQty = cart.length;

            res.json({ success: true, message: "Thêm vào giỏ hàng thành công!", totalQty: totalQty });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }

    static async updateCart(req, res) {
        const productId = req.params.id;
        const action = req.query.action;
        let cart = req.cart || [];

        const item = cart.find(item => item.id == productId);
        if (item) {
            if (action === 'increase') {
                try {
                    const product = await Product.getProductById(productId);
                    if (product && item.quantity < product.quantity) {
                        item.quantity++;
                    } else {
                        return res.redirect('/cart?error=' + encodeURIComponent('Sản phẩm không đủ hàng'));
                    }
                } catch (err) {
                    console.error(err);
                }
            } else if (action === 'decrease') {
                item.quantity--;
                if (item.quantity <= 0) cart = cart.filter(i => i.id != productId);
            }
        }

        const cookieName = CartController.getCartCookieName(req, res);
        res.cookie(cookieName, JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 });
        res.redirect('/cart');
    }

    static removeFromCart(req, res) {
        const productId = req.params.id;
        let cart = req.cart || [];
        cart = cart.filter(item => item.id != productId);

        const cookieName = CartController.getCartCookieName(req, res);
        res.cookie(cookieName, JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 });
        res.redirect('/cart');
    }

    static getCartData(req, res) {
        const cart = req.cart || [];
        res.json({ success: true, cart: cart });
    }
}

module.exports = CartController;
