const title = 'Alice in Wonderland';
fetch(`https://gutendex.com/books/?search=${encodeURIComponent(title)}`)
  .then(res => res.json())
  .then(data => {
    console.log('Results count:', data.count);
    if (data.results && data.results.length > 0) {
      const book = data.results[0];
      console.log('Book Title:', book.title);
      console.log('Formats keys:', Object.keys(book.formats));
      
      const txtUrl = book.formats['text/plain; charset=utf-8'] || book.formats['text/plain'];
      console.log('TXT URL:', txtUrl);
      
      if (txtUrl) {
        return fetch(txtUrl)
          .then(res => res.text())
          .then(text => {
            console.log('Text length fetched:', text.length);
            console.log('Snippet of book:', text.substring(1000, 1500));
          });
      }
    } else {
      console.log('No book found in Gutenberg.');
    }
  })
  .catch(err => {
    console.error('Error:', err);
  });
