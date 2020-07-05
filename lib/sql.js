class SQL {
  constructor(db) {
    this.db = db;
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
}

module.exports = SQL;
