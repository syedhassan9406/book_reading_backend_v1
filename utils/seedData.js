const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Book = require('../models/Book');
const Discussion = require('../models/Discussion');
const Review = require('../models/Review');
const connectDB = require('../config/db');

dotenv.config();

const dummyBooks = [
  {
    title: "The Berlin Bea Setton",
    author: "Olivia Clark",
    category: "Thriller",
    price: 8.2,
    rating: 4.4,
    image: "assets/images/image8.jpg",
    description: "A thrilling story full of suspense. Secrets and lies lurk everywhere.",
  },
  {
    title: "The Berlin Bea Setton",
    author: "Elena Richardson",
    category: "Romantic Novel",
    price: 7.2,
    rating: 4.6,
    image: "assets/images/image1.jpg",
    description: "A heartwarming tale of love and second chances. Romance blooms unexpectedly.",
  },
  {
    title: "The Love of My Life",
    author: "Sophie Turner",
    category: "Romantic Novel",
    price: 7.0,
    rating: 4.3,
    image: "assets/images/image2.jpg",
    description: "An unforgettable romance that explores deep emotions. Love conquers all obstacles.",
  },
  {
    title: "Midnight in Paris",
    author: "James Holloway",
    category: "Drama",
    price: 8.5,
    rating: 4.8,
    image: "assets/images/image3.jpg",
    description: "A dramatic journey of love and betrayal. Faces of past secrets emerge.",
  },
  {
    title: "Whispers of the Heart",
    author: "Ava Bennett",
    category: "Romantic Novel",
    price: 6.9,
    rating: 4.2,
    image: "assets/images/image4.jpg",
    description: "Follow your heart through gentle whispers. Dreams and desires collide softly.",
  },
  {
    title: "The Silent Forest",
    author: "Daniel Carter",
    category: "Mystery",
    price: 9.1,
    rating: 4.7,
    image: "assets/images/image5.jpg",
    description: "Mystery unfolds in a dark, silent forest. Danger waits behind every tree.",
  },
  {
    title: "Echoes of Tomorrow",
    author: "Liam Anderson",
    category: "Science Fiction",
    price: 10.0,
    rating: 4.5,
    image: "assets/images/image6.jpg",
    description: "A futuristic adventure across time. Choices today shape tomorrow.",
  },
  {
    title: "Broken Dreams",
    author: "Noah Mitchell",
    category: "Drama",
    price: 6.5,
    rating: 4.1,
    image: "assets/images/image7.jpg",
    description: "A story of lost hopes and struggles. Healing comes from unexpected places.",
  },
  {
    title: "A Summer to Remember",
    author: "Emma Roberts",
    category: "Romantic Novel",
    price: 7.8,
    rating: 4.6,
    image: "assets/images/image9.jpg",
    description: "A summer romance that warms the soul. Memories linger long after.",
  },
  {
    title: "Shadows of the Past",
    author: "William Scott",
    category: "Mystery",
    price: 9.3,
    rating: 4.9,
    image: "assets/images/image10.jpg",
    description: "Dark secrets haunt the present. Past mistakes resurface unexpectedly.",
  },
  {
    title: "The Last Letter",
    author: "Charlotte Green",
    category: "Romantic Novel",
    price: 6.8,
    rating: 4.3,
    image: "assets/images/image11.jpg",
    description: "A letter that changes everything. Love and regret intertwined.",
  },
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear previous data
    await User.deleteMany();
    await Book.deleteMany();
    await Discussion.deleteMany();
    await Review.deleteMany();

    console.log('Database cleared.');

    // Seed Admin and Normal User
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpassword',
      isAdmin: true,
    });

    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword',
      isAdmin: false,
    });

    console.log('Users seeded successfully.');

    // Fetch real books from Gutenberg API
    console.log('Fetching real books from Gutenberg API for seeding...');
    const searchQueries = ['classics', 'mystery', 'science fiction', 'romance', 'history'];
    const realBooks = [];
    
    for (const q of searchQueries) {
      try {
        const response = await fetch(
          `https://gutendex.com/books/?search=${encodeURIComponent(q)}&languages=en`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          // Take 3 popular books per category
          const booksToProcess = data.results.slice(0, 3);
          for (const book of booksToProcess) {
            const googleBooksId = `gutenberg_${book.id}`;
            
            const title = book.title || 'Untitled';
            
            let author = 'Unknown Author';
            if (book.authors && book.authors.length > 0) {
              const authorObj = book.authors[0];
              if (authorObj.name) {
                const parts = authorObj.name.split(',');
                if (parts.length === 2) {
                  author = `${parts[1].trim()} ${parts[0].trim()}`;
                } else {
                  author = authorObj.name;
                }
              }
            }
            
            let category = 'Classics';
            if (book.subjects && book.subjects.length > 0) {
              const firstSubject = book.subjects[0].toLowerCase();
              if (firstSubject.includes('fiction')) category = 'Fiction';
              else if (firstSubject.includes('drama') || firstSubject.includes('play')) category = 'Drama';
              else if (firstSubject.includes('poetry') || firstSubject.includes('poem')) category = 'Poetry';
              else if (firstSubject.includes('adventure') || firstSubject.includes('voyage')) category = 'Adventure';
              else if (firstSubject.includes('science fiction') || firstSubject.includes('dystopian')) category = 'Sci-Fi';
              else if (firstSubject.includes('romance') || firstSubject.includes('love')) category = 'Romance';
              else if (firstSubject.includes('mystery') || firstSubject.includes('detective')) category = 'Mystery';
              else if (firstSubject.includes('horror') || firstSubject.includes('gothic')) category = 'Horror';
              else if (firstSubject.includes('history') || firstSubject.includes('historical')) category = 'History';
              else {
                const mainPart = book.subjects[0].split('--')[0].trim();
                category = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
              }
            }
            
            let image = 'assets/images/image1.jpg';
            if (book.formats && book.formats['image/jpeg']) {
              image = book.formats['image/jpeg'];
            } else {
              image = `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.cover.medium.jpg`;
            }

            const price = 0.00; // Free classic books!

            const rating = Math.round((4.0 + (book.id % 10) / 10) * 10) / 10;
            
            const subjectsList = book.subjects ? book.subjects.slice(0, 3).map(s => s.split('--')[0].trim()) : [];
            const description = `A masterpiece of world literature, "${title}" is a timeless classic by ${author}. This work covers themes of ${subjectsList.join(', ') || 'classic storytelling'} and is a must-read for book lovers.`;
            
            const pages = 150 + (book.id % 350);
            const language = book.languages && book.languages.length > 0 
              ? (book.languages[0] === 'en' ? 'English' : book.languages[0].toUpperCase())
              : 'English';

            // Avoid adding duplicates during the loop
            if (!realBooks.some(b => b.googleBooksId === googleBooksId)) {
              realBooks.push({
                googleBooksId,
                title,
                author,
                category,
                image,
                price,
                rating,
                description,
                pages,
                language
              });
            }
          }
        }
      } catch (err) {
        console.error(`Failed to fetch books for query "${q}":`, err.message);
      }
    }

    if (realBooks.length === 0) {
      console.log('Using fallback dummy books because API fetch failed.');
      realBooks.push(...dummyBooks);
    }

    // Seed Books
    const createdBooks = await Book.insertMany(realBooks);
    console.log(`${createdBooks.length} books seeded successfully.`);

    // Set up some initial reading progress for testUser
    testUser.library.push({
      book: createdBooks[0]._id,
      status: 'reading',
      completedPages: 45,
      totalPages: 190,
      currentChapter: 'Chapter 2 - New Hope'
    });
    testUser.library.push({
      book: createdBooks[1]._id,
      status: 'reading',
      completedPages: 80,
      totalPages: 210,
      currentChapter: 'Chapter 4'
    });
    testUser.library.push({
      book: createdBooks[2]._id,
      status: 'finished',
      completedPages: 180,
      totalPages: 180,
      currentChapter: 'Epilogue'
    });

    // Seed wishlist
    testUser.wishlist.push(createdBooks[3]._id);
    testUser.wishlist.push(createdBooks[4]._id);

    await testUser.save();
    console.log('User library progress and wishlist seeded.');

    // Seed some discussions
    const discussion1 = await Discussion.create({
      user: testUser._id,
      userName: testUser.name,
      title: 'Olivia Clark\'s Thriller - My Thoughts',
      content: 'I just finished Olivia Clark\'s new thriller. The suspense was incredible! The twist at the end caught me completely off-guard.',
      category: 'Thriller',
      isBookClub: false,
    });

    discussion1.comments.push({
      user: adminUser._id,
      userName: adminUser.name,
      content: 'I agree! That chapter in the middle was really intense. Looking forward to her next book.'
    });
    await discussion1.save();

    const bookClub1 = await Discussion.create({
      user: adminUser._id,
      userName: adminUser.name,
      title: 'Romantic Novel Book Club',
      content: 'Welcome to the Romantic Novel Book Club! We discuss heartwarming tales of love, second chances, and all things romance.',
      category: 'Romantic Novel',
      isBookClub: true,
      clubName: 'The Romance Readers',
      members: [adminUser._id, testUser._id]
    });
    console.log('Discussions and book clubs seeded.');

    // Seed reviews
    await Review.create({
      user: testUser._id,
      userName: testUser.name,
      book: createdBooks[0]._id,
      rating: 4,
      comment: 'Excellent book, loved the pacing and character arcs!'
    });
    await Review.create({
      user: adminUser._id,
      userName: adminUser.name,
      book: createdBooks[0]._id,
      rating: 5,
      comment: 'A masterpiece! Highly recommend to all thriller enthusiasts.'
    });

    console.log('Reviews seeded successfully.');
    console.log('Data Seeding Completed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error during data seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
