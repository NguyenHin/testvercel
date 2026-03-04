const db = require('../db');

class Product {
    static async getAllProducts(filters = {}) {
        let query = `
            SELECT
                p.*,
                GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as author_name
            FROM products p
            LEFT JOIN product_authors pa ON p.id = pa.product_id
            LEFT JOIN authors a ON pa.author_id = a.id
        `;

        let queryParams = [];
        let whereClauses = [];

        if (filters.keyword && filters.keyword.trim() !== '') {
            whereClauses.push(`(p.name LIKE ? OR a.name LIKE ?)`);
            queryParams.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
        }

        if (filters.category_id && parseInt(filters.category_id) > 0) {
            query += ` JOIN product_categories pc ON p.id = pc.product_id `;
            whereClauses.push(`pc.category_id = ?`);
            queryParams.push(filters.category_id);
        }

        if (filters.status && filters.status !== 'all') {
            if (filters.status === 'visible') {
                whereClauses.push(`p.is_hidden = 0`);
            } else if (filters.status === 'hidden') {
                whereClauses.push(`p.is_hidden = 1`);
            }
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
        }

        query += `
            GROUP BY p.id
            ORDER BY p.id DESC
        `;

        if (filters.limit) {
            query += ` LIMIT ? OFFSET ?`;
            queryParams.push(Number(filters.limit), Number(filters.offset) || 0);
        }

        const [rows] = await db.query(query, queryParams);
        return rows;
    }

    static async countProducts(filters = {}) {
        let query = `
            SELECT count(DISTINCT p.id) as total
            FROM products p
        `;
        let queryParams = [];
        let whereClauses = [];

        if (filters.keyword && filters.keyword.trim() !== '') {
            query += ` LEFT JOIN product_authors pa ON p.id = pa.product_id
                       LEFT JOIN authors a ON pa.author_id = a.id `;
            whereClauses.push(`(p.name LIKE ? OR a.name LIKE ?)`);
            queryParams.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
        }

        if (filters.category_id && parseInt(filters.category_id) > 0) {
            query += ` JOIN product_categories pc ON p.id = pc.product_id `;
            whereClauses.push(`pc.category_id = ?`);
            queryParams.push(filters.category_id);
        }

        if (filters.status && filters.status !== 'all') {
            if (filters.status === 'visible') {
                whereClauses.push(`p.is_hidden = 0`);
            } else if (filters.status === 'hidden') {
                whereClauses.push(`p.is_hidden = 1`);
            }
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
        }

        const [rows] = await db.query(query, queryParams);
        return rows[0].total;
    }

    static async getProductById(id) {
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
    }

    static async getProductsByCategory(categoryId) {
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
    }

    static async getCategoryName(categoryId) {
        const [rows] = await db.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
        return rows[0] ? rows[0].name : 'Danh mục';
    }

    static async getBestSellers() {
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
    }

    static async getNewArrivals() {
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
    }

    static async getOnSaleProducts() {
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
    }

    static async searchProducts(keyword) {
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
    }

    static async getOrCreateAuthor(authorName) {
        if (!authorName) return null;
        const [rows] = await db.query('SELECT id FROM authors WHERE name = ?', [authorName.trim()]);
        if (rows.length > 0) return rows[0].id;
        const [result] = await db.query('INSERT INTO authors (name) VALUES (?)', [authorName.trim()]);
        return result.insertId;
    }

    static async getOrCreatePublisher(publisherName) {
        if (!publisherName) return null;
        const [rows] = await db.query('SELECT id FROM publishers WHERE name = ?', [publisherName.trim()]);
        if (rows.length > 0) return rows[0].id;
        const [result] = await db.query('INSERT INTO publishers (name) VALUES (?)', [publisherName.trim()]);
        return result.insertId;
    }

    static async getOrCreateSupplier(supplierName) {
        if (!supplierName) return null;
        const [rows] = await db.query('SELECT id FROM suppliers WHERE name = ?', [supplierName.trim()]);
        if (rows.length > 0) return rows[0].id;
        const [result] = await db.query('INSERT INTO suppliers (name) VALUES (?)', [supplierName.trim()]);
        return result.insertId;
    }

    static async createProduct(data) {
        const authorId = await Product.getOrCreateAuthor(data.author_name);
        const publisherId = await Product.getOrCreatePublisher(data.publisher_name);
        const supplierId = await Product.getOrCreateSupplier(data.supplier_name);

        const { name, price, description, image_url, quantity, publication_year, pages, cover_type, category_id, language, dimensions, is_hidden } = data;
        const hiddenStatus = is_hidden ? 1 : 0;

        const productQuery = `
            INSERT INTO products (name, price, description, image_url, quantity, is_hidden, publisher_id, supplier_id, publication_year, pages, cover_type, language, dimensions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(productQuery, [name, price, description, image_url, quantity, hiddenStatus, publisherId, supplierId, publication_year, pages, cover_type, language, dimensions]);
        const productId = result.insertId;

        if (category_id) await db.query('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)', [productId, category_id]);
        if (authorId) await db.query('INSERT INTO product_authors (product_id, author_id) VALUES (?, ?)', [productId, authorId]);

        return result;
    }

    static async updateProduct(id, data) {
        const authorId = await Product.getOrCreateAuthor(data.author_name);
        const publisherId = await Product.getOrCreatePublisher(data.publisher_name);
        const supplierId = await Product.getOrCreateSupplier(data.supplier_name);

        const { name, price, description, image_url, quantity, publication_year, pages, cover_type, category_id, language, dimensions, is_hidden } = data;
        const hiddenStatus = is_hidden ? 1 : 0;

        const productQuery = `
            UPDATE products SET
            name = ?, price = ?, description = ?, image_url = ?, quantity = ?, is_hidden = ?, publisher_id = ?, supplier_id = ?,
            publication_year = ?, pages = ?, cover_type = ?, language = ?, dimensions = ?
            WHERE id = ?
        `;
        await db.query(productQuery, [name, price, description, image_url, quantity, hiddenStatus, publisherId, supplierId, publication_year, pages, cover_type, language, dimensions, id]);

        if (category_id) {
            await db.query('DELETE FROM product_categories WHERE product_id = ?', [id]);
            await db.query('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)', [id, category_id]);
        }
        if (authorId) {
            await db.query('DELETE FROM product_authors WHERE product_id = ?', [id]);
            await db.query('INSERT INTO product_authors (product_id, author_id) VALUES (?, ?)', [id, authorId]);
        }
    }

    static async deleteProduct(id) {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        return result;
    }

    static async getCategories() {
        const [rows] = await db.query('SELECT * FROM categories');
        return rows;
    }

    static async getAuthors() {
        const [rows] = await db.query('SELECT * FROM authors');
        return rows;
    }

    static async getPublishers() {
        const [rows] = await db.query('SELECT * FROM publishers');
        return rows;
    }

    static async updateStock(id, quantitySold) {
        const query = `UPDATE products SET quantity = quantity - ?, sold_count = sold_count + ? WHERE id = ?`;
        const [result] = await db.query(query, [quantitySold, quantitySold, id]);
        return result;
    }

    static async importStock(id, quantityImport, note) {
        const updateQuery = `UPDATE products SET quantity = quantity + ? WHERE id = ?`;
        await db.query(updateQuery, [quantityImport, id]);
        const logQuery = `INSERT INTO inventory_logs (product_id, quantity, note) VALUES (?, ?, ?)`;
        await db.query(logQuery, [id, quantityImport, note]);
    }

    static async getInventoryLogs(productId) {
        const query = `SELECT * FROM inventory_logs WHERE product_id = ? ORDER BY created_at DESC`;
        const [rows] = await db.query(query, [productId]);
        return rows;
    }

    static async getReviews(productId) {
        const query = `
            SELECT reviews.*, users.full_name
            FROM reviews
            JOIN users ON reviews.user_id = users.id
            WHERE reviews.product_id = ? AND reviews.status = 'APPROVED'
            ORDER BY reviews.created_at DESC
        `;
        const [rows] = await db.query(query, [productId]);
        return rows;
    }

    static async addReview(userId, productId, rating, comment) {
        const query = `INSERT INTO reviews (user_id, product_id, rating, comment, status) VALUES (?, ?, ?, ?, 'PENDING')`;
        const [result] = await db.query(query, [userId, productId, rating, comment]);
        return result;
    }

    static async getAllReviewsForAdmin() {
        const query = `
            SELECT r.*, u.username, p.name as product_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    static async updateReviewStatus(id, status) {
        await db.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    }

    static async deleteReview(id) {
        await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    }

    static async addAdminReply(reviewId, replyText) {
        const query = `UPDATE reviews SET admin_reply = ?, replied_at = NOW() WHERE id = ?`;
        await db.query(query, [replyText, reviewId]);
    }
}

module.exports = Product;

