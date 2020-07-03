const sqlite3 = require('sqlite3').verbose();

class SQL {
  constructor(dbPath) {
    this.dbPath = dbPath;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) return reject(err);
        resolve('connected!!!');
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) return reject(err);
        resolve('closed');
      });
    });
  }

  exec(query) {
    return new Promise((resolve, reject) => {
      this.db.exec(query, (err) => {
        if (err) return reject(err);
        resolve('done');
      });
    });
  }

  getAll(query) {
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  get(query) {
    return new Promise((resolve, reject) => {
      this.db.get(query, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  createTransaction(operations) {
    return new Promise((resolve) => {
      const operationList = operations.join('; ');
      const transaction = `BEGIN TRANSACTION; ${operationList}; COMMIT;`;
      resolve(transaction);
    });
  }
}

module.exports = SQL;
