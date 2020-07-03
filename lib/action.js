const insertBook = function (client, book) {
  const bookValues = `'${book.serialNo}', '${book.isbn}', '${book.title}'`;
  const updateBookQuery = `INSERT INTO books VALUES (${bookValues})`;
  const authorQueries = book.authors.map((author) => {
    return `INSERT INTO authors VALUES('${book.serialNo}', '${author}')`;
  });
  const availabilityValues = `'${book.serialNo}', '${book.numberOfCopies}', '${book.numberOfCopies}', TRUE`;
  const availabilityQuery = `INSERT INTO availability VALUES(${availabilityValues})`;
  const categoryQueries = book.categories.map((category) => {
    return `INSERT INTO category VALUES('${category}', '${book.serialNo}')`;
  });
  return client.createTransaction([
    updateBookQuery,
    ...authorQueries,
    availabilityQuery,
    ...categoryQueries,
  ]);
};

const issueBook = function (client, serialNo, userId) {
  return new Promise((resolve, reject) => {
    const isBookAvailable = `SELECT available from availability where serial_no = '${serialNo}'`;
    client
      .connect()
      .then(() => client.getAll(isBookAvailable))
      .then(([log]) => {
        const { available } = log;
        if (!available) return reject('No copy available');
        const updateCount = `UPDATE availability SET available_copy_count = available_copy_count - 1 WHERE serial_no = '${serialNo}'`;
        const updateAvailability = `UPDATE availability SET available = FALSE WHERE available_copy_count = 0 AND serial_no = '${serialNo}'`;
        const addLog = `INSERT INTO library_log VALUES( '${serialNo}','${userId}',datetime(),date('now', '+15 day'),'Issue')`;
        const transaction = client.createTransaction([
          updateCount,
          updateAvailability,
          addLog,
        ]);
        resolve(transaction);
      });
  });
};

const returnBook = function (client, serialNo, userId) {
  return new Promise((resolve, reject) => {
    const isBookIssuedQuery = [
      'SELECT action FROM library_log',
      `WHERE user_id = '${userId}' AND serial_no = '${serialNo}'`,
      'ORDER BY issue_date DESC LIMIT 1;',
    ].join(' ');
    client
      .connect()
      .then(() => client.getAll(isBookIssuedQuery))
      .then(([log]) => {
        const { action } = log;
        if (!(action === 'Issue')) reject("You haven't issued this book");
        const updateCount = `UPDATE availability SET available_copy_count = available_copy_count + 1 WHERE serial_no = '${serialNo}'`;
        const updateAvailability = `UPDATE availability SET available = TRUE WHERE serial_no = '${serialNo}'`;
        const addLog = `INSERT INTO library_log VALUES( '${serialNo}','${userId}',datetime(),NULL,'Return')`;
        const transaction = client.createTransaction([
          updateCount,
          updateAvailability,
          addLog,
        ]);
        resolve(transaction);
      })
      .catch(() => reject("You haven't issued this book"));
  });
};

module.exports = { insertBook, issueBook, returnBook };
