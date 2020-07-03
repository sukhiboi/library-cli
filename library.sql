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