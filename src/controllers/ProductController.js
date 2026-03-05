const Product = require('../models/Product');

class ProductController {
    static async search(req, res) {
        try {
            const keyword = req.query.q;
            if (!keyword || keyword.trim() === "") {
                const products = await Product.getAllProducts();
                return res.render('home', { products: products, searchError: "Vui lòng nhập từ khóa để tìm kiếm!" });
            }
            const products = await Product.searchProducts(keyword);
            res.render('home', { products: products, keyword: keyword });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi tìm kiếm");
        }
    }

    static async getProductDetail(req, res) {
        try {
            const productId = req.params.id;
            const product = await Product.getProductById(productId);
            if (!product) return res.status(404).send("Sản phẩm không tồn tại");

            // Lấy danh sách sản phẩm liên quan (cùng danh mục)
            const relatedProducts = await Product.getRelatedProducts(productId, product.category_id);
            const reviews = await Product.getReviews(productId);

            let canReview = false;
            let reviewMessage = "Vui lòng đăng nhập để đánh giá.";
            if (res.locals.user) {
                canReview = true;
                reviewMessage = "";
            }

            res.render('product_detail', { product, relatedProducts, reviews, canReview, reviewMessage });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi server");
        }
    }

    static async addReview(req, res) {
        if (!res.locals.user) return res.redirect('/auth/login');
        if (res.locals.user.role === 'admin') return res.status(403).send("Admin không thể đánh giá!");

        try {
            const { rating, comment } = req.body;
            await Product.addReview(res.locals.user.id, req.params.id, rating, comment);
            res.send(`<script>alert('Đánh giá đã gửi và đang chờ duyệt!'); window.location.href = '/product/${req.params.id}';</script>`);
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi khi gửi đánh giá");
        }
    }

    static async getByCategory(req, res) {
        try {
            const categoryId = req.params.id;
            const products = await Product.getProductsByCategory(categoryId);
            const categoryName = await Product.getCategoryName(categoryId);
            res.render('home', { products: products, categoryName: categoryName });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi lọc danh mục");
        }
    }

    static async getBestSellers(req, res) {
        try {
            const products = await Product.getBestSellers();
            res.render('home', { products: products, categoryName: 'Sách Bán Chạy' });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi lấy sách bán chạy");
        }
    }

    static async getNewArrivals(req, res) {
        try {
            const products = await Product.getNewArrivals();
            res.render('home', { products: products, categoryName: 'Sách Mới Phát Hành' });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi lấy sách mới");
        }
    }

    static async getOnSale(req, res) {
        try {
            const products = await Product.getOnSaleProducts();
            res.render('home', { products: products, categoryName: 'Sách Đang Khuyến Mãi' });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi lấy sách khuyến mãi");
        }
    }
}

module.exports = ProductController;
