const sqlite3 = require('sqlite3').verbose();
const vorpal = require('vorpal')();
const chalk = require('chalk');
const { table, getBorderCharacters } = require('table');
const SQL = require('./lib/sql');

const {
  generateInsertBookTransaction,
  generateIssueBookTransaction,
  generateReturnBookTransaction,
  generateGetBooksQuery,
} = require('./lib/action');
const {
  insertBookPrompt,
  issueBookPrompt,
  returnBookPrompt,
} = require('./prompt');

const db = new sqlite3.Database('./library.db', (err) => {
  if (err) throw new Error(err);
});
const client = new SQL(db);

vorpal
  .command('insert book', 'Insert a book into Library')
  .action(function (args, cb) {
    this.prompt(insertBookPrompt).then((answers) => {
      const book = {
        ...answers,
        authors: answers.authors.split(','),
        categories: answers.categories.split(','),
      };
      generateInsertBookTransaction(client, book)
        .then((transaction) => client.exec(transaction))
        .then(() => {
          cb(chalk.green.bold('Book successfully inserted'));
        })
        .catch((err) => cb(chalk.red.bold('Unable to insert book')));
    });
  });

vorpal
  .command('issue book', 'Issue a book from Library')
  .action(function (args, cb) {
    this.prompt(issueBookPrompt).then((answers) => {
      const [key, id] = Object.keys(answers).slice(1);
      const query = `SELECT serial_no FROM books WHERE ${key} = '${answers[key]}'`;
      client
        .get(query)
        .then(({ serial_no }) => {
          return generateIssueBookTransaction(client, serial_no, answers[id]);
        })
        .then((transaction) => client.exec(transaction))
        .then(() => {
          cb(chalk.green.bold('Issued. Return the book in 15 days'));
        })
        .catch((err) => cb(chalk.red.bold(err)));
    });
  });

vorpal
  .command('return book', 'Return a book to Library')
  .action(function (args, cb) {
    this.prompt(returnBookPrompt).then((answers) => {
      const { serialNo, id } = answers;
      generateReturnBookTransaction(client, serialNo, id)
        .then((transaction) => client.exec(transaction))
        .then(() => {
          cb(chalk.green.bold('Return successful. Have a nice day'));
        })
        .catch((err) => cb(chalk.red.bold(err)));
    });
  });

const formatSelectResults = function (results) {
  const headerFields = Object.keys(results[0]);
  const tableHeader = headerFields.map((fields) => {
    return chalk.bold.green(fields);
  });
  const tableRows = results.map((row) => Object.values(row));
  const tableOptions = {
    border: getBorderCharacters('norc'),
  };
  const booksTable = table([tableHeader, ...tableRows], tableOptions);
  return booksTable;
};

vorpal
  .command('get books', 'Get list of all books in Library')
  .option('-c, --category <category>', 'Filter by Category')
  .option('-a, --author <author>', 'Filter by Author')
  .action(({ options }, cb) => {
    client
      .getAll(generateGetBooksQuery(options))
      .then((rows) => {
        const booksTable = formatSelectResults(rows);
        cb(booksTable);
      })
      .catch((err) => cb(chalk.red.bold('No books found')));
  });

vorpal.command('logs', 'Get transaction logs').action((args, cb) => {
  const query = 'SELECT * FROM library_log';
  client
    .getAll(query)
    .then((rows) => {
      const logTable = formatSelectResults(rows);
      cb(logTable);
    })
    .catch((err) => cb(chalk.red.bold('No logs available')));
});

const delimiter = chalk.yellow.bold('\nLibrary $ ');
vorpal.delimiter(delimiter).show();
