/**
 * Seed script: inserts initial books if the table is empty.
 * Run from backend: npm run seed
 */
import '../src/load-env';
import { sequelize } from '../src/db/client';
import '../src/db/models';
import { Book } from '../src/db/models';

// JavaScript & web dev books (titles/authors from Amazon.in search; cover images via Open Library by ISBN)
const SEED_BOOKS = [
  { title: 'JavaScript: The Definitive Guide, 7th Edition', author: 'David Flanagan', isbn: '9352139968' },
  { title: 'JavaScript Masterclass: A comprehensive guide to mastering JavaScript programming', author: 'Yanko Belov', isbn: '9355517076' },
  { title: 'Head First JavaScript Programming: A Learner\'s Guide to Modern JavaScript, Second Edition', author: 'Eric Freeman, Elisabeth Robson', isbn: '9355428480' },
  { title: 'Mastering HTML, CSS & JavaScript Web Publishing', author: 'Laura Lemay, Rafe Colburn', isbn: '8183335152' },
  { title: 'Eloquent JavaScript: A Modern Introduction to Programming', author: 'Marijn Haverbeke', isbn: '1718504101' },
  { title: 'JavaScript: Functional Programming for JavaScript Developers', author: 'Ved Antani, Simon Timms', isbn: '1787124665' },
  { title: 'JavaScript from Beginner to Professional', author: 'Laurence Lars Svekis, Maaike Van Putten', isbn: '1800562527' },
  { title: 'Coding with JavaScript for Dummies', author: 'Chris Minnick, Eva Holland', isbn: '8126556668' },
  { title: 'JavaScript Absolute Beginner\'s Guide, 3rd Edition', author: 'Kirupa Chinnathambi', isbn: '9361592017' },
  { title: 'The Art of Web Development: Learn HTML, CSS & JavaScript', author: 'Sanjay Kant, Praveen Kumar', isbn: null, imageUrl: 'https://placehold.co/120x180/e8e8e8/666?text=Web+Dev' },
  { title: 'JavaScript and HTML5 Now', author: 'Kyle Simpson', isbn: null, imageUrl: 'https://placehold.co/120x180/e8e8e8/666?text=JS+HTML5' },
  { title: 'JavaScript for Beginners: 2022 Crash Course', author: 'Edie Clem', isbn: null, imageUrl: 'https://placehold.co/120x180/e8e8e8/666?text=JS+Guide' },
];

type SeedBook = (typeof SEED_BOOKS)[0];

function thumbnailForBook(book: SeedBook): string | null {
  if ('imageUrl' in book && book.imageUrl) return book.imageUrl;
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
  return null;
}

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const count = await Book.count();
    if (count > 0) {
      console.log(`Books table already has ${count} row(s). Skipping seed.`);
      process.exit(0);
      return;
    }

    await Book.bulkCreate(
      SEED_BOOKS.map((b) => ({
        title: b.title,
        author: b.author,
        isbn: b.isbn ?? null,
        status: 'AVAILABLE' as const,
        thumbnailUrl: thumbnailForBook(b),
      })),
    );
    console.log(`Seeded ${SEED_BOOKS.length} books.`);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
