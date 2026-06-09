const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the SQLite database file
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Initialize the database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize tables if they don't exist
        const schema = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf8');
        db.exec(schema, (err) => {
            if (err) console.error('Error creating schema:', err);
        });
    }
});

// Create a wrapper to use Promises with sqlite3
const pool = {
    query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            // Convert Postgres $1, $2 syntax to SQLite ? syntax
            const sqliteSql = sql.replace(/\$\d+/g, '?');
            
            // Check if it's an INSERT/UPDATE/DELETE or a SELECT
            if (sqliteSql.trim().toUpperCase().startsWith('SELECT') || sqliteSql.trim().toUpperCase().startsWith('PRAGMA')) {
                db.all(sqliteSql, params, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ rows: rows });
                    }
                });
            } else {
                db.run(sqliteSql, params, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        // Return this.lastID and this.changes similar to Postgres RETURNING output for our basic needs
                        // We wrap it in a 'rows' array so existing code like `result.rows[0]` won't crash immediately,
                        // though we'll update the specific auth.js queries as well.
                        resolve({
                            lastID: this.lastID,
                            changes: this.changes,
                            rows: [{ id: this.lastID }]
                        });
                    }
                });
            }
        });
    }
};

module.exports = pool;
