const express = require('express');
const mysql = require('mysql');

const PORT = process.env.PORT || 3000;

const connection = mysql.createConnection({
    host: 'db',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'node_app',
});

connection.connect();

connection.beginTransaction(beginTransactionError => {
    if (beginTransactionError != null) {
        throw beginTransactionError;
    }

    connection.query('INSERT INTO people (name) VALUES (?)', "Allisson", (insertError, results) => {
        if (insertError != null) {
            connection.rollback(() => { throw insertError; });
        }

        connection.commit(commitTransactionError => {
            if (commitTransactionError) {
              return connection.rollback(() => {
                throw commitTransactionError;
              });
            }
          });
    });
});

const app = express();

app.get('/people', (req, res) => {
    connection.query('SELECT * FROM people', (error, results) => {
        if (error != null) {
            return res.status(500).send(`
                <h1>Error</h1>
                <h2>Status: 500</h2>
                <h3>Detail:</h3>
                <pre><code>${JSON.stringify(error, null, 4)}</code></pre>
            `);
        }

        res.send(`
            <h1>Full Cycle Rocks!</h1>

            <ul>
                ${results.map(people => `<li>${people.name}</li>`).join('')}
            </ul>
        `);
    });
});

app.listen(PORT, () => {
    console.log(`Application started at port ${PORT}`);
});
