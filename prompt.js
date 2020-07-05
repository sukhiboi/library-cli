const insertBookPrompt = [
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
];

const issueBookPrompt = [
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
    name: 'serial_no',
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
];

const returnBookPrompt = [
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
];

module.exports = { insertBookPrompt, issueBookPrompt, returnBookPrompt };
