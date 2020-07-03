const vorpal = require('vorpal')();
const chalk = require('chalk');
const { table } = require('table');
const SQL = require('./lib/sql');
const client = new SQL('./library.db');
const { insertBook, issueBook, returnBook } = require('./lib/action');

vorpal
  .command('insert book', 'Insert a book into Library')
  .action(function (args, cb) {
    this.prompt([
      {
        name: 'isbn',
        message: 'ISBN Number: ',
        type: 'input',
        validate: (str) => Boolean(str),
      },
      {
        name: 'serialNo',
        message: 'Serial Number: ',
        type: 'input',
        validate: (str) => Boolean(str),
      },
      {
        name: 'title',
        message: 'Enter title: ',
        type: 'input',
        validate: (str) => Boolean(str),
      },
      {
        name: 'authors',
        message: 'Enter authors: ',
        type: 'input',
        validate: (str) => Boolean(str),
      },
      {
        name: 'categories',
        message: 'Enter categories: ',
        type: 'input',
        validate: (str) => Boolean(str),
      },
      {
        name: 'numberOfCopies',
        message: 'Copy count: ',
        type: 'number',
        validate: (num) => Boolean(num),
      },
    ]).then((answers) => {
      const book = {
        ...answers,
        authors: answers.authors.split(','),
        categories: answers.categories.split(','),
      };
      client
        .connect()
        .then(() => insertBook(client, book))
        .then((transaction) => client.exec(transaction))
        .then(() => cb(chalk.green.bold('Book successfully inserted')))
        .then(() => client.close())
        .catch((err) => cb(chalk.red.bold(err)));
    });
  });

vorpal
  .command('issue book', 'Issue a book from Library')
  .action(function (args, cb) {
    this.prompt([
      {
        name: 'refer',
        message: 'Select the detail you know about book',
        type: 'list',
        choices: ['ISBN Number', 'Serial Number', 'Title'],
      },
      {
        name: 'isbn',
        message: 'ISBN Number: ',
        type: 'input',
        when: ({ refer }) => refer === 'ISBN Number',
        validate: (str) => Boolean(str),
      },
      {
        name: 'serialNo',
        message: 'Serial Number: ',
        type: 'input',
        when: ({ refer }) => refer === 'Serial Number',
        validate: (str) => Boolean(str),
      },
      {
        name: 'title',
        message: 'Enter title: ',
        type: 'input',
        when: ({ refer }) => refer === 'Title',
        validate: (str) => Boolean(str),
      },
      {
        name: 'id',
        message: 'Enter your id: ',
        type: 'input',
        validate: (str) => Boolean(str),
      },
    ]).then((answers) => {
      const getSerialNo = function () {
        if (answers.isbn)
          return function () {
            const query = `SELECT serial_no FROM books WHERE isbn = '${answers.isbn}'`;
            return client.get(query);
          };
        if (answers.title)
          return function () {
            const query = `SELECT serial_no FROM books WHERE title = '${answers.title}'`;
            return client.get(query);
          };
        return function () {
          const query = `SELECT serial_no FROM books WHERE serial_no = '${answers.serialNo}'`;
          return client.get(query);
        };
      };
      client
        .connect()
        .then(getSerialNo())
        .then(({ serial_no }) => issueBook(client, serial_no, answers.id))
        .then((transaction) => client.exec(transaction))
        .then(() => cb(chalk.green.bold('Issued. Return the book in 15 days')))
        .then(() => client.close())
        .catch((err) => cb(chalk.red.bold(err)));
    });
  });

vorpal
  .command('return book', 'Return a book to Library')
  .action(function (args, cb) {
    this.prompt([
      {
        name: 'serialNo',
        message: 'Serial Number: ',
        type: 'input',
        validate: (str) => Boolean(str),
      },
      {
        name: 'id',
        message: 'Enter your id: ',
        type: 'input',
        validate: (str) => Boolean(str),
      },
    ]).then((answers) => {
      client
        .connect()
        .then(() => returnBook(client, answers.serialNo, answers.id))
        .then((transaction) => client.exec(transaction))
        .then(() => cb(chalk.green.bold('Return successful. Have a nice day')))
        .then(() => client.close())
        .catch((err) => cb(chalk.red.bold(err)));
    });
  });

vorpal
  .command('get books', 'Get list of all books in Library')
  .option('-c, --category <category>', 'Filter by Category')
  .option('-a, --author <author>', 'Filter by Author')
  .action(({ options }, cb) => {
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
    if (options.category && options.author)
      queryParts.push(`WHERE ${authorSpecific} AND ${categorySpecific}`);
    else if (options.category) queryParts.push(`WHERE ${categorySpecific}`);
    else if (options.author) queryParts.push(`WHERE ${authorSpecific}`);
    client
      .connect()
      .then(() => client.getAll(queryParts.join(' ')))
      .then((rows) => {
        const tableHeader = Object.keys(rows[0]).map((header) => {
          return chalk.bold.green(header);
        });
        const tableRows = rows.map((row) => Object.values(row));
        cb(table([tableHeader, ...tableRows]));
      })
      .catch((err) => cb(chalk.red.bold(err)));
  });

vorpal.command('logs').action((args, cb) => {
  const query = 'SELECT * FROM library_log';
  client
    .connect()
    .then(() => client.getAll(query))
    .then((rows) => {
      const tableHeader = Object.keys(rows[0]).map((header) => {
        return chalk.bold.green(header);
      });
      const tableRows = rows.map((row) => Object.values(row));
      cb(table([tableHeader, ...tableRows]));
    })
    .catch((err) => cb(chalk.red.bold(err)));
});

const delimiter = chalk.yellow.bold('Library $ ');
vorpal.delimiter(delimiter).show();
