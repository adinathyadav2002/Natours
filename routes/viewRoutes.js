const express = require('express');

const router = express.Router();

const viewController = require('../controllers/viewController');

// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     title: 'Explore the Tours',
//   });
// });

router.get('/tour/:slug', viewController.getTour);

router.get('/', viewController.getOverview);

module.exports = router;
