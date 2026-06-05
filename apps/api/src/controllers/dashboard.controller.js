const db = require('../config/db');
const { success } = require('../utils/response');

const overview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Total income this month
    const [incomeRow] = await db('income')
      .where({ user_id: userId })
      .whereRaw('MONTH(recorded_at) = ? AND YEAR(recorded_at) = ?', [month, year])
      .sum('amount as total');

    // Total expenses this month
    const [expenseRow] = await db('expenses')
      .where({ user_id: userId })
      .whereRaw('MONTH(recorded_at) = ? AND YEAR(recorded_at) = ?', [month, year])
      .sum('amount as total');

    // Expense breakdown by category
    const categoryBreakdown = await db('expenses')
      .where({ user_id: userId })
      .whereRaw('MONTH(recorded_at) = ? AND YEAR(recorded_at) = ?', [month, year])
      .groupBy('category')
      .select('category')
      .sum('amount as total')
      .orderBy('total', 'desc');

    // Top spending category
    const topCategory = categoryBreakdown[0] || null;

    // Total saved across all goals
    const [savingsRow] = await db('savings_goals')
      .where({ user_id: userId })
      .sum('saved_amount as total');

    // Monthly income goal vs actual
    const user = await db('users')
      .where({ id: userId })
      .select('monthly_income_goal', 'currency')
      .first();

    const totalIncome = Number(incomeRow.total) || 0;
    const totalExpenses = Number(expenseRow.total) || 0;
    const totalSaved = Number(savingsRow.total) || 0;

    // Recent expenses (last 5)
    const recentExpenses = await db('expenses')
      .where({ user_id: userId })
      .orderBy('recorded_at', 'desc')
      .limit(5);

    return success(res, {
      month,
      year,
      currency: user.currency,
      income: {
        total: totalIncome,
        goal: user.monthly_income_goal,
        variance: user.monthly_income_goal ? totalIncome - user.monthly_income_goal : null,
      },
      expenses: {
        total: totalExpenses,
        breakdown: categoryBreakdown,
        top_category: topCategory,
      },
      available_cash: totalIncome - totalExpenses,
      total_saved: totalSaved,
      recent_expenses: recentExpenses,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { overview };
