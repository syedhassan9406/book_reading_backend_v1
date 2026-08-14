const Book = require('../models/Book');

// Helper to fetch and cache books from Gutenberg (Gutendex) API
const fetchAndUpsertGutenbergBooks = async (searchQuery) => {
  try {
    let url = 'https://gutendex.com/books/?languages=en';
    if (searchQuery && searchQuery !== 'bestsellers' && searchQuery !== 'fiction') {
      url = `https://gutendex.com/books/?search=${encodeURIComponent(searchQuery)}&languages=en`;
    }
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const booksToProcess = data.results.slice(0, 10);
      for (const book of booksToProcess) {
        const googleBooksId = `gutenberg_${book.id}`;
        
        const title = book.title || 'Untitled';
        
        // Format author name from "Austen, Jane" to "Jane Austen"
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
        
        // Classify Category
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
        
        // Cover image
        let image = 'assets/images/image1.jpg'; // default fallback
        if (book.formats && book.formats['image/jpeg']) {
          image = book.formats['image/jpeg'];
        } else {
          image = `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.cover.medium.jpg`;
        }

        // Real books are free
        const price = 0.00;

        // Rating
        const rating = Math.round((4.0 + (book.id % 10) / 10) * 10) / 10;
        
        // Description
        const subjectsList = book.subjects ? book.subjects.slice(0, 3).map(s => s.split('--')[0].trim()) : [];
        const description = `A masterpiece of world literature, "${title}" is a timeless classic by ${author}. This work covers themes of ${subjectsList.join(', ') || 'classic storytelling'} and is a must-read for book lovers.`;
        
        const pages = 150 + (book.id % 350);
        const language = book.languages && book.languages.length > 0 
          ? (book.languages[0] === 'en' ? 'English' : book.languages[0].toUpperCase())
          : 'English';

        // Upsert book
        await Book.findOneAndUpdate(
          { googleBooksId },
          {
            $set: {
              title,
              author,
              category,
              image,
              price,
              rating,
              description,
              pages,
              language,
            },
          },
          { upsert: true, new: true }
        );
      }
    }
  } catch (error) {
    console.error('Gutenberg API fetch failed:', error.message);
  }
};

// @desc    Get all books (supports search and category filters)
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const { search, category } = req.query;

    // Auto-seed with real books if database is empty or has fewer than 10 books
    const bookCount = await Book.countDocuments();
    if (bookCount < 10) {
      console.log('Seeding initial real books from Gutenberg API...');
      await fetchAndUpsertGutenbergBooks('bestsellers');
    }

    if (search && search.trim() !== '') {
      await fetchAndUpsertGutenbergBooks(search);
    }

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a book
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res) => {
  const { title, author, category, image, price, description, pages, language } = req.body;

  try {
    const book = new Book({
      title,
      author,
      category,
      image,
      price,
      description,
      pages,
      language,
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  const { title, author, category, image, price, description, pages, language } = req.body;

  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      book.title = title || book.title;
      book.author = author || book.author;
      book.category = category || book.category;
      book.image = image || book.image;
      book.price = price !== undefined ? price : book.price;
      book.description = description || book.description;
      book.pages = pages !== undefined ? pages : book.pages;
      book.language = language || book.language;

      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
  try {
    const result = await Book.findByIdAndDelete(req.params.id);

    if (result) {
      res.json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
