const Product = require('../models/Product');

class ProductService {
    static async getAllProducts() {
        return await Product.getAllProducts();
    }

    static async getProductDetails(productId) {
        const product = await Product.getProductById(productId);
        if (!product) {
            throw new Error("Sản phẩm không tồn tại");
        }

        // In a real scenario, this would have a more complex query based on tags or categories
        const relatedProducts = await Product.getProductsByCategory(product.category_id || 1);
        const reviews = await Product.getReviews(productId);

        return {
            product,
            relatedProducts,
            reviews
        };
    }

    static async search(keyword) {
        if (!keyword || keyword.trim() === "") {
            throw new Error("Vui lòng nhập từ khóa để tìm kiếm");
        }
        return await Product.searchProducts(keyword.trim());
    }

    static async getProductsByCategory(categoryId) {
        const products = await Product.getProductsByCategory(categoryId);
        const categoryName = await Product.getCategoryName(categoryId);

        return {
            categoryName,
            products
        };
    }

    static async addReview(userId, productId, rating, comment) {
        // Validation could go here
        if (!rating || rating < 1 || rating > 5) {
            throw new Error("Đánh giá không hợp lệ");
        }
        return await Product.addReview(userId, productId, rating, comment);
    }
}

module.exports = ProductService;
