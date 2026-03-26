const express = require('express');
const userController = require('../controllers/Admins/users');
const subscriptionController = require('../controllers/Admins/subscriptions');
const reportsController = require('../controllers/Admins/reports');

const router = express.Router();

//User-related routes
router.get('/user/chart-data', userController.getAllUsersChartsData);
router.get('/user/metrics', userController.getAllUsersMetrics);
router.get('/user/search', userController.searchAllUsers);
router.post('/user/suspend/:userId', userController.suspendUserCommunity);
router.post('/user/lift-suspension/:userId', userController.liftSuspension);

//Subscription-related routes
router.get('/subs/chart-data', subscriptionController.getSubsChartData);
router.get('/subs/metrics', subscriptionController.getTotalSubsMetrics);

//Reports-related routes
router.get('/reports', reportsController.getReports);
router.post('/reports/dismiss-content', reportsController.dismissContentReports);
router.post('/reports/resolve-content', reportsController.resolveContentReports);

module.exports = router;