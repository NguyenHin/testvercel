const Product = require('../models/Product');

class CartController {
    static viewCart(req, res) {
        const cart = req.cart || [];
        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        res.render('cart', { cart: cart, totalAmount: totalAmount });
    }

    static async addToCart(req, res) {
        const productId = req.params.id;
        const quantity = parseInt(req.body.quantity) || 1;
        try {
            const product = await Product.getProductById(productId);
            if (!product) return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });

            let cart = req.cart || [];
            const existingItem = cart.find(item => item.id == productId);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: quantity });
            }

            res.cookie('cart', JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 });
            const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
            res.json({ success: true, message: "Thêm vào giỏ hàng thành công!", totalQty: totalQty });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }

    static updateCart(req, res) {
        const productId = req.params.id;
        const action = req.query.action;
        let cart = req.cart || [];

        const item = cart.find(item => item.id == productId);
        if (item) {
            if (action === 'increase') item.quantity++;
            else if (action === 'decrease') {
                item.quantity--;
                if (item.quantity <= 0) cart = cart.filter(i => i.id != productId);
            }
        }

        res.cookie('cart', JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 });
        res.redirect('/cart');
    }

    static removeFromCart(req, res) {
        const productId = req.params.id;
        let cart = req.cart || [];
        cart = cart.filter(item => item.id != productId);

        res.cookie('cart', JSON.stringify(cart), { maxAge: 24 * 60 * 60 * 1000 });
        res.redirect('/cart');
    }
}

module.exports = CartController;
