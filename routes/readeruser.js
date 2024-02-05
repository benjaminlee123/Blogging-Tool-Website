/**
 * These are the routes and functionalities related to the readers
 */

const express = require('express');
const router = express.Router();

/**
 * @description Redirects the main route to the home route.
 */
router.get('/', function (req, res) {
  res.redirect('/reader');
});

/**
 * @description Fetches the list of published articles in descending order of publication.
 */
router.get('/reader', (req, res, next) => {
  global.db.all('SELECT id, title, subtitle, published FROM Article WHERE Published NOT NULL ORDER BY published DESC;', function (err, articles) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      res.render('reader-home.ejs', { articles, getColor });
    }
  });
});

/**
 * @description Presents a single article in reading mode.
 */
router.get('/reader/:id', (req, res, next) => {
  const { id } = req.params;
  global.db.get('SELECT a.id, a.title, a.subtitle, a.body, a.published, COUNT(r.userSession) as likes FROM Article a LEFT JOIN Reaction r ON r.articleId = a.id WHERE a.id = ?;', id, function (err, article) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      global.db.all('SELECT body, created FROM Comment WHERE articleId = ? ORDER BY created DESC;', id, function (err, comments) {
        if (err) {
          next(err); //send the error on to the error handler
        } else {
          res.render('reader-article.ejs', { article, comments, color: getColor(article.id) });
        }
      });
    }
  });
});

/**
 * @description Updates the count of likes by adding the userSession.
 */
router.post('/like/:articleId', (req, res, next) => {
  const { articleId } = req.params;
  global.db.get(
    'SELECT * FROM Reaction WHERE articleId = ? AND userSession = ?;',
    [articleId, global.userSession],
    function(err, row) {
      if (err) {
        next(err); //send the error on to the error handler
      } else if (row) {
        res.status(200).json({ alreadyLiked: true });
      } else {
        global.db.run(
          'INSERT INTO Reaction (articleId, userSession) VALUES (?, ?);',
          [articleId, global.userSession],
          function (err) {
            if (err) {
              next(err); //send the error on to the error handler
            } else {
              res.status(200).json({ alreadyLiked: false });
              next();
            }
          }
        );
      }
    }
  );
});


/**
 * @description Adds a comment to an article.
 */
router.post('/comment/:articleId', (req, res, next) => {
  const { articleId } = req.params;
  global.db.run(
    'INSERT INTO Comment (articleId, body, created) VALUES (?, ?, DATETIME());',
    [articleId, req.body.comment],
    function (err) {
      if (err) {
        next(err); //send the error on to the error handler
      } else {
        res.redirect('/reader/' + articleId);
        next();
      }
    }
  );
});
/**
 * @description Generates a color code for an id.
 */

function getColor(id) {
  const colors = ['primary', 'success', 'danger', 'warning', 'info'];
  return colors[id % 5];
}

module.exports = router;
