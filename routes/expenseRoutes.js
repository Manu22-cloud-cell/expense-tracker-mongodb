const express = require('express');
const router = express.Router();
const expenseController = require('../controller/expenseController');
const auth = require('../middleware/auth');

router.post('/add', auth, expenseController.addExpenses);
router.get('/', auth, expenseController.getAllExpenses);
router.put('/update/:id', auth, expenseController.updateExpense);
router.delete('/delete/:id', auth, expenseController.deleteExpense);


module.exports = router;