/**
 *  These are the routes and functionalities related to the authors
 */

const express = require('express');
const router = express.Router();

/**
 * @description Fetches the list of published articles sorted by publication date.
 */
router.get('/', (req, res, next) => {
  global.db.all('SELECT id, title, created, modified, published, (Select COUNT(userSession) FROM Reaction WHERE articleId = id) as likes FROM Article;', function (err, articles) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      res.render('author-home.ejs', { articles });
    }
  });
});

/**
 * @description Presents the creation page for a new article.
 */
router.get('/new', (req, res) => {
  res.render('author-edit.ejs');
});

/**
 * @description Constructs a new article.
 */
router.post('/new', (req, res, next) => {
  const { title, subtitle, body } = req.body;
  global.db.run(
    'INSERT INTO Article (title, subtitle, body, created) VALUES (?, ?, ?, dateTime());',
    [title, subtitle, body],
    function (err) {
      if (err) {
        next(err); //send the error on to the error handler
      } else {
        res.redirect('/author');
        next();
      }
    }
  );
});

/**
 * @description Presents the edit page for a selected article.
 */
router.get('/edit/:id', (req, res, next) => {
  const { id } = req.params;
  global.db.get('SELECT a.id, a.title, a.subtitle, a.body, a.created, a.modified, a.published, COUNT(r.userSession) as likes FROM Article a LEFT JOIN Reaction r ON r.articleId = a.id WHERE a.id = ?;', id, function (err, article) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      res.render('author-edit.ejs', article);
    }
  });
});

/**
 * @description Updates an existing article.
 */
router.post('/edit/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, subtitle, body } = req.body;
  global.db.run(
    'UPDATE Article SET title = ?, subtitle = ?, body = ?, modified = DATETIME() WHERE id = ?;',
    [title, subtitle, body, id],
    function (err) {
      if (err) {
        next(err); //send the error on to the error handler
      } else {
        res.redirect('/author');
        next();
      }
    }
  );
});

/**
 * @description Publishes a draft article, making it available to read.
 */
router.post('/publish/:articleId', (req, res, next) => {
  const { articleId } = req.params;
  global.db.run(
    'UPDATE Article SET published = DATETIME() WHERE id = ?;', articleId, function (err) {
      if (err) {
        next(err); //send the error on to the error handler
      } else {
        res.sendStatus(204);
        next();
      }
    }
  );
});

/**
 * @description Deletes an article from the database
 */
router.delete('/delete/:articleId', (req, res, next) => {
  const { articleId } = req.params;
  global.db.run(
    'DELETE FROM Article WHERE id = ?;', articleId, function (err) {
      if (err) {
        next(err); //send the error on to the error handler
      } else {
        res.sendStatus(204);
        next();
      }
    }
  );
});

/**
 * @description Navigates to the author's settings page for updating blog information.
 */
router.get('/settings', function (req, res) {
  res.render('author-settings.ejs', { 
    title: global.settings.title, 
    subtitle: global.settings.subtitle, 
    author: global.settings.author 
  });//p
});
/**
 * @description Updates the blog's main settings.
 */
router.post('/settings', (req, res, next) => {
  const { title, subtitle, author } = req.body;
  global.db.run(
    'UPDATE Settings SET value = CASE id WHEN "title" THEN ? WHEN "subtitle" THEN ? WHEN "author" THEN ? ELSE value END WHERE id IN ("title", "subtitle", "author");',
    [title, subtitle, author],
    function (err) {
      if (err) {
        next(err); //send the error on to the error handler
      } else {
        global.settings = { title, subtitle, author };
        res.redirect('/author');
        next();
      }
    }
  );
});

module.exports = router;
