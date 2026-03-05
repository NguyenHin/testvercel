const db = require('./src/db');
async function test() {
    const [columns] = await db.query('SHOW COLUMNS FROM orders');
    console.log("COLUMNS:", columns.map(c => c.Field));
    process.exit();
}
test();
