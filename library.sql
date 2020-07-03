DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS library_log;
DROP TABLE IF EXISTS category;
CREATE TABLE books (
    serial_no VARCHAR PRIMARY KEY,
    isbn VARCHAR,
    title VARCHAR
);
CREATE TABLE authors(serial_no VARCHAR, author_name VARCHAR);
CREATE TABLE availability (
    serial_no VARCHAR PRIMARY KEY,
    total_copies NUMERIC,
    available_copy_count NUMERIC,
    available BOOLEAN
);
CREATE TABLE library_log (
    serial_no VARCHAR,
    user_id VARCHAR NOT NULL,
    issue_date DATETIME,
    due_date DATETIME,
    "action" VARCHAR,
    CHECK (
        "action" = "Issue"
        OR "action" = "Return"
    )
);
CREATE TABLE category (
    category_type VARCHAR,
    serial_no VARCHAR NOT NULL
);
SELECT books.serial_no AS 'Serial No.',
    books.isbn AS 'ISBN No.',
    books.title AS Title,
    authors.author_name AS Author,
    availability.available_copy_count as 'Book Count',
    availability.available AS 'Availability',
    category.category_type AS 'Category'
FROM books
    LEFT JOIN authors ON books.serial_no = authors.serial_no
    LEFT JOIN availability ON books.serial_no = availability.serial_no
    LEFT JOIN category ON books.serial_no = category.serial_no;
-----------------------------------------
SELECT *
FROM books;
SELECT *
FROM authors;
SELECT *
FROM availability;
SELECT *
FROM library_log;
SELECT *
FROM category;