const db = require('../db');

class Category {
    static async getAllCategories(filters = {}) {
        let query = `SELECT * FROM categories`;
        let queryParams = [];
        let whereClauses = [];

        if (filters.keyword && filters.keyword.trim() !== '') {
            whereClauses.push(`name LIKE ?`);
            queryParams.push(`%${filters.keyword}%`);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
        }

        query += ` ORDER BY id DESC`;

        if (filters.limit) {
            query += ` LIMIT ? OFFSET ?`;
            queryParams.push(Number(filters.limit), Number(filters.offset) || 0);
        }

        const [rows] = await db.query(query, queryParams);
        return rows;
    }

    static async countCategories(filters = {}) {
        let query = `SELECT count(id) as total FROM categories`;
        let queryParams = [];
        let whereClauses = [];

        if (filters.keyword && filters.keyword.trim() !== '') {
            whereClauses.push(`name LIKE ?`);
            queryParams.push(`%${filters.keyword}%`);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
        }

        const [rows] = await db.query(query, queryParams);
        return rows[0] ? rows[0].total : 0;
    }

    static async getCategoryById(id) {
        const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0];
    }

    static async createCategory(data) {
        const { name } = data;
        const query = `INSERT INTO categories (name) VALUES (?)`;
        const [result] = await db.query(query, [name]);
        return result;
    }

    static async updateCategory(id, data) {
        const { name } = data;
        const query = `UPDATE categories SET name = ? WHERE id = ?`;
        const [result] = await db.query(query, [name, id]);
        return result;
    }

    static async deleteCategory(id) {
        const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
        return result;
    }
}

module.exports = Category;
