const vorpal = require('vorpal')();
const chalk = require('chalk');
const inquirer = require('inquirer');
const SQL = require('./lib/sql');
const client = new SQL('./library.db');
const { insertBook, issueBook, returnBook } = require('./lib/action');

const stringValidation = (str) => str && typeof str === 'string';
const numberValidation = (num) =>
  Number.isInteger(num) && typeof num === 'number';

vorpal
  .command('insert book', 'Insert a book into Library')
  .action((args, cb) => {
    inquirer
      .prompt([
        {
          name: 'isbn',
          message: 'ISBN Number: ',
          type: 'input',
          validate: stringValidation,
        },
        {
          name: 'serialNo',
          message: 'Serial Number: ',
          type: 'input',
          validate: stringValidation,
        },
        {
          name: 'title',
          message: 'Enter title: ',
          type: 'input',
          validate: stringValidation,
        },
        {
          name: 'authors',
          message: 'Enter authors: ',
          type: 'input',
          validate: stringValidation,
        },
        {
          name: 'categories',
          message: 'Enter categories: ',
          type: 'input',
          validate: stringValidation,
        },
        {
          name: 'numberOfCopies',
          message: 'Copy count: ',
          type: 'number',
          validate: numberValidation,
        },
      ])
      .then((answers) => {
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

vorpal.command('issue book').action((args, cb) => {
  inquirer
    .prompt([
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
        validate: stringValidation,
      },
      {
        name: 'serialNo',
        message: 'Serial Number: ',
        type: 'input',
        when: ({ refer }) => refer === 'Serial Number',
        validate: stringValidation,
      },
      {
        name: 'title',
        message: 'Enter title: ',
        type: 'input',
        when: ({ refer }) => refer === 'Title',
        validate: stringValidation,
      },
      {
        name: 'id',
        message: 'Enter your id: ',
        type: 'input',
        validate: stringValidation,
      },
    ])
    .then((answers) => {
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

vorpal.command('return book').action((args, cb) => {
  inquirer
    .prompt([
      {
        name: 'serialNo',
        message: 'Serial Number: ',
        type: 'input',
        validate: stringValidation,
      },
      {
        name: 'id',
        message: 'Enter your id: ',
        type: 'input',
        validate: stringValidation,
      },
    ])
    .then((answers) => {
      client
        .connect()
        .then(() => returnBook(client, answers.serialNo, answers.id))
        .then((transaction) => client.exec(transaction))
        .then(() => cb(chalk.green.bold('Return successful. Have a nice day')))
        .then(() => client.close())
        .catch((err) => cb(chalk.red.bold(err)));
    });
});

const delimiter = chalk.yellow.bold('Library $ ');
vorpal.delimiter(delimiter).show();
