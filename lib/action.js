const createTransaction = function (operations) {
  const operationList = operations.join('; ');
  const transaction = `BEGIN TRANSACTION; ${operationList}; COMMIT;`;
  return transaction;
};

const generateInsertBookTransaction = function (client, book) {
  return new Promise((resolve, reject) => {
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
    const transaction = createTransaction([
      updateBookQuery,
      ...authorQueries,
      availabilityQuery,
      ...categoryQueries,
    ]);
    resolve(transaction);
  });
};

const generateIssueBookTransaction = function (client, serialNo, userId) {
  return new Promise((resolve, reject) => {
    const isBookAvailable = `SELECT available from availability where serial_no = '${serialNo}'`;
    client.getAll(isBookAvailable).then(([log]) => {
      const { available } = log;
      if (!available) return reject('No copy available');
      const updateCount = `UPDATE availability SET available_copy_count = available_copy_count - 1 WHERE serial_no = '${serialNo}'`;
      const updateAvailability = `UPDATE availability SET available = FALSE WHERE available_copy_count = 0 AND serial_no = '${serialNo}'`;
      const addLog = `INSERT INTO library_log VALUES( '${serialNo}','${userId}',datetime(),date('now', '+15 day'),'Issue')`;
      const transaction = createTransaction([
        updateCount,
        updateAvailability,
        addLog,
      ]);
      resolve(transaction);
    });
  });
};

const generateReturnBookTransaction = function (client, serialNo, userId) {
  return new Promise((resolve, reject) => {
    const isBookIssuedQuery = [
      'SELECT action FROM library_log',
      `WHERE user_id = '${userId}' AND serial_no = '${serialNo}'`,
      'ORDER BY issue_date DESC LIMIT 1;',
    ].join(' ');
    client
      .getAll(isBookIssuedQuery)
      .then(([log]) => {
        const { action } = log;
        if (!(action === 'Issue')) reject("You haven't issued this book");
        const updateCount = `UPDATE availability SET available_copy_count = available_copy_count + 1 WHERE serial_no = '${serialNo}'`;
        const updateAvailability = `UPDATE availability SET available = TRUE WHERE serial_no = '${serialNo}'`;
        const addLog = `INSERT INTO library_log VALUES( '${serialNo}','${userId}',datetime(),NULL,'Return')`;
        const transaction = createTransaction([
          updateCount,
          updateAvailability,
          addLog,
        ]);
        resolve(transaction);
      })
      .catch(() => reject("You haven't issued this book"));
  });
};

const generateGetBooksQuery = function (options) {
  const queryParts = [
    `SELECT books.serial_no AS 'Serial No.',`,
    `books.isbn AS 'ISBN No.',`,
    `books.title AS Title,`,
    `authors.author_name AS Author,`,
    `availability.available_copy_count as 'Available Book Count',`,
    `category.category_type AS 'Category'`,
    `FROM books`,
    `LEFT JOIN authors ON books.serial_no = authors.serial_no`,
    `LEFT JOIN availability ON books.serial_no = availability.serial_no`,
    `LEFT JOIN category ON books.serial_no = category.serial_no`,
  ];
  const authorSpecific = `authors.author_name = '${options.author}'`;
  const categorySpecific = `category.category_type = '${options.category}'`;
  if (options.category && options.author) {
    queryParts.push(`WHERE ${authorSpecific} AND ${categorySpecific}`);
    return queryParts.join(' ');
  }
  if (options.category) queryParts.push(`WHERE ${categorySpecific}`);
  if (options.author) queryParts.push(`WHERE ${authorSpecific}`);
  return queryParts.join(' ');
};

module.exports = {
  generateInsertBookTransaction,
  generateIssueBookTransaction,
  generateReturnBookTransaction,
  generateGetBooksQuery,
};
