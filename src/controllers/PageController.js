const Product = require('../models/Product');

class PageController {
    static staticPages = {
        'terms': { title: 'Điều khoản sử dụng', content: `<p>Chào mừng bạn đến với BookTotal...</p>` },
        'privacy': { title: 'Chính sách bảo mật', content: `<p>BookTotal cam kết bảo mật thông tin...</p>` },
        'payment-privacy': { title: 'Chính sách bảo mật thanh toán', content: `<p>Hệ thống thanh toán an toàn...</p>` },
        'about': { title: 'Giới thiệu BookTotal', content: `<p>BookTotal được thành lập với sứ mệnh...</p>` },
        'store-system': { title: 'Hệ thống trung tâm - nhà sách', content: `<p>Danh sách cửa hàng...</p>` },
        'return-policy': { title: 'Chính sách đổi trả', content: `<p>BookTotal hỗ trợ đổi trả sản phẩm...</p>` },
        'warranty-policy': { title: 'Chính sách bảo hành', content: `<p>Bảo hành sản phẩm...</p>` },
        'shipping-policy': { title: 'Chính sách vận chuyển', content: `<p>Giao hàng toàn quốc...</p>` },
        'wholesale-policy': { title: 'Chính sách khách sỉ', content: `<p>Chiết khấu hấp dẫn...</p>` },
        'payment-methods': { title: 'Phương thức thanh toán', content: `<p>Đa dạng phương thức...</p>` }
    };

    static async home(req, res) {
        try {
            const products = await Product.getAllProducts();
            res.render('home', { products: products });
        } catch (err) {
            console.error(err);
            res.render('home', { products: [] });
        }
    }

    static showStaticPage(req, res) {
        const slug = req.params.slug;
        const pageData = PageController.staticPages[slug];
        if (pageData) {
            res.render('page', { title: pageData.title, content: pageData.content });
        } else {
            res.status(404).render('page', { title: 'Không tìm thấy trang', content: '<p>Nội dung không tồn tại.</p>' });
        }
    }
}

module.exports = PageController;
