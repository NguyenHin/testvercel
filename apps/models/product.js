const db = require('../../db'); 

module.exports = {
    getAllProducts: async () => {
        const query = `
            SELECT
                p.*,
                GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as author_name
            FROM products p
            LEFT JOIN product_authors pa ON p.id = pa.product_id
            LEFT JOIN authors a ON pa.author_id = a.id
            GROUP BY p.id
            ORDER BY p.id DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    getProductById: async (id) => {
        const query = `
            SELECT
                p.*,
                pub.name as publisher_name,
                sup.name as supplier_name,
                GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') as category_name,
                GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as author_name,
                (SELECT category_id FROM product_categories WHERE product_id = p.id LIMIT 1) as category_id,
                (SELECT author_id FROM product_authors WHERE product_id = p.id LIMIT 1) as author_id
            FROM products p
            LEFT JOIN publishers pub ON p.publisher_id = pub.id
            LEFT JOIN suppliers sup ON p.supplier_id = sup.id
            LEFT JOIN product_categories pc ON p.id = pc.product_id
            LEFT JOIN categories c ON pc.category_id = c.id
            LEFT JOIN product_authors pa ON p.id = pa.product_id
            LEFT JOIN authors a ON pa.author_id = a.id
            WHERE p.id = ?
            GROUP BY p.id
        `;
        const [rows] = await db.query(query, [id]);
        return rows[0]; 
    },

    getProductsByCategory: async (categoryId) => {
        const query = `
            SELECT
                p.*,
                GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as author_name
            FROM products p
            JOIN product_categories pc ON p.id = pc.product_id
            LEFT JOIN product_authors pa ON p.id = pa.product_id
            LEFT JOIN authors a ON pa.author_id = a.id
            WHERE pc.category_id = ?
            GROUP BY p.id
            ORDER BY p.id DESC
        `;
        const [rows] = await db.query(query, [categoryId]);
        return rows;
    },

    getCategoryName: async (categoryId) => {
        const [rows] = await db.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
        return rows[0] ? rows[0].name : 'Danh mục';
    },

    // HÀM MỚI: Sách bán chạy (Top 10 theo sold_count)
    getBestSellers: async () => {
        const query = `
            SELECT
                p.*,
                GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as author_name
            FROM products p
            LEFT JOIN product_authors pa ON p.id = pa.product_id
            LEFT JOIN authors a ON pa.author_id = a.id
            GROUP BY p.id
            ORDER BY p.sold_count DESC
            LIMIT 10
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // HÀM MỚI: Sách mới (Top 10 theo created_at)
    getNewArrivals: async () => {
        const query = `
            SELECT
                p.*,
                GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as author_name
            FROM products p
            LEFT JOIN product_authors pa ON p.id = pa.product_id
            LEFT JOIN authors a ON pa.author_id = a.id
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT 10
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // HÀM MỚI: Khuyến mãi (Giả lập: Lấy ngẫu nhiên 10 sản phẩm)
    // Trong thực tế sẽ lọc theo bảng promotions hoặc cột discount_price
    getOnSaleProducts: async () => {
        const query = `
            SELECT
                p.*,
                GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as author_name
            FROM products p
            LEFT JOIN product_authors pa ON p.id = pa.product_id
            LEFT JOIN authors a ON pa.author_id = a.id
            GROUP BY p.id
            ORDER BY RAND()
            LIMIT 10
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    searchProducts: async (keyword) => {
        const query = `
            SELECT
                p.*,
                GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as author_name
            FROM products p
            LEFT JOIN product_authors pa ON p.id = pa.product_id
            LEFT JOIN authors a ON pa.author_id = a.id
            WHERE p.name LIKE ? OR a.name LIKE ?
            GROUP BY p.id
            ORDER BY p.id DESC
        `;
        const searchTerm = `%${keyword}%`;
        const [rows] = await db.query(query, [searchTerm, searchTerm]);
        return rows;
    },

    getOrCreateAuthor: async (authorName) => {
        if (!authorName) return null;
        const [rows] = await db.query('SELECT id FROM authors WHERE name = ?', [authorName.trim()]);
        if (rows.length > 0) return rows[0].id;
        const [result] = await db.query('INSERT INTO authors (name) VALUES (?)', [authorName.trim()]);
        return result.insertId;
    },

    getOrCreatePublisher: async (publisherName) => {
        if (!publisherName) return null;
        const [rows] = await db.query('SELECT id FROM publishers WHERE name = ?', [publisherName.trim()]);
        if (rows.length > 0) return rows[0].id;
        const [result] = await db.query('INSERT INTO publishers (name) VALUES (?)', [publisherName.trim()]);
        return result.insertId;
    },

    getOrCreateSupplier: async (supplierName) => {
        if (!supplierName) return null;
        const [rows] = await db.query('SELECT id FROM suppliers WHERE name = ?', [supplierName.trim()]);
        if (rows.length > 0) return rows[0].id;
        const [result] = await db.query('INSERT INTO suppliers (name) VALUES (?)', [supplierName.trim()]);
        return result.insertId;
    },

    createProduct: async (data) => {
        const authorId = await module.exports.getOrCreateAuthor(data.author_name);
        const publisherId = await module.exports.getOrCreatePublisher(data.publisher_name);
        const supplierId = await module.exports.getOrCreateSupplier(data.supplier_name);

        const { name, price, description, image_url, quantity, publication_year, pages, cover_type, category_id, language, dimensions } = data;

        const productQuery = `
            INSERT INTO products (name, price, description, image_url, quantity, publisher_id, supplier_id, publication_year, pages, cover_type, language, dimensions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(productQuery, [name, price, description, image_url, quantity, publisherId, supplierId, publication_year, pages, cover_type, language, dimensions]);
        const productId = result.insertId;

        if (category_id) await db.query('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)', [productId, category_id]);
        if (authorId) await db.query('INSERT INTO product_authors (product_id, author_id) VALUES (?, ?)', [productId, authorId]);

        return result;
    },

    updateProduct: async (id, data) => {
        const authorId = await module.exports.getOrCreateAuthor(data.author_name);
        const publisherId = await module.exports.getOrCreatePublisher(data.publisher_name);
        const supplierId = await module.exports.getOrCreateSupplier(data.supplier_name);

        const { name, price, description, image_url, quantity, publication_year, pages, cover_type, category_id, language, dimensions } = data;

        const productQuery = `
            UPDATE products SET
            name = ?, price = ?, description = ?, image_url = ?, quantity = ?, publisher_id = ?, supplier_id = ?,
            publication_year = ?, pages = ?, cover_type = ?, language = ?, dimensions = ?
            WHERE id = ?
        `;
        await db.query(productQuery, [name, price, description, image_url, quantity, publisherId, supplierId, publication_year, pages, cover_type, language, dimensions, id]);

        if (category_id) {
            await db.query('DELETE FROM product_categories WHERE product_id = ?', [id]);
            await db.query('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)', [id, category_id]);
        }
        if (authorId) {
            await db.query('DELETE FROM product_authors WHERE product_id = ?', [id]);
            await db.query('INSERT INTO product_authors (product_id, author_id) VALUES (?, ?)', [id, authorId]);
        }
    },

    deleteProduct: async (id) => {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        return result;
    },

    getCategories: async () => {
        const [rows] = await db.query('SELECT * FROM categories');
        return rows;
    },

    getAuthors: async () => {
        const [rows] = await db.query('SELECT * FROM authors');
        return rows;
    },

    getPublishers: async () => {
        const [rows] = await db.query('SELECT * FROM publishers');
        return rows;
    },

    updateStock: async (id, quantitySold) => {
        const query = `UPDATE products SET quantity = quantity - ?, sold_count = sold_count + ? WHERE id = ?`;
        const [result] = await db.query(query, [quantitySold, quantitySold, id]);
        return result;
    },

    importStock: async (id, quantityImport, note) => {
        const updateQuery = `UPDATE products SET quantity = quantity + ? WHERE id = ?`;
        await db.query(updateQuery, [quantityImport, id]);
        const logQuery = `INSERT INTO inventory_logs (product_id, quantity, note) VALUES (?, ?, ?)`;
        await db.query(logQuery, [id, quantityImport, note]);
    },

    getInventoryLogs: async (productId) => {
        const query = `SELECT * FROM inventory_logs WHERE product_id = ? ORDER BY created_at DESC`;
        const [rows] = await db.query(query, [productId]);
        return rows;
    },

    getReviews: async (productId) => {
        const query = `
            SELECT reviews.*, users.full_name
            FROM reviews
            JOIN users ON reviews.user_id = users.id
            WHERE reviews.product_id = ? AND reviews.status = 'APPROVED'
            ORDER BY reviews.created_at DESC
        `;
        const [rows] = await db.query(query, [productId]);
        return rows;
    },

    addReview: async (userId, productId, rating, comment) => {
        const query = `INSERT INTO reviews (user_id, product_id, rating, comment, status) VALUES (?, ?, ?, ?, 'PENDING')`;
        const [result] = await db.query(query, [userId, productId, rating, comment]);
        return result;
    },

    getAllReviewsForAdmin: async () => {
        const query = `
            SELECT r.*, u.username, p.name as product_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    updateReviewStatus: async (id, status) => {
        await db.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    },

    deleteReview: async (id) => {
        await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    },

    addAdminReply: async (reviewId, replyText) => {
        const query = `UPDATE reviews SET admin_reply = ?, replied_at = NOW() WHERE id = ?`;
        await db.query(query, [replyText, reviewId]);
    }
};