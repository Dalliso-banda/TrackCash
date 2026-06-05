const bcrypt = require('bcryptjs');

exports.seed = async (knex) => {
  await knex('savings_deposits').del();
  await knex('savings_goals').del();
  await knex('income').del();
  await knex('expenses').del();
  await knex('users').del();

  const password_hash = await bcrypt.hash('password123', 10);

  await knex('users').insert({
    id: 1,
    name: 'Mwila Banda',
    email: 'mwila@trackcash.app',
    password_hash,
    currency: 'ZMW',
    monthly_income_goal: 4000.00,
  });

  await knex('expenses').insert([
    { user_id: 1, amount: 15.00, category: 'food', note: 'Ice cream', recorded_at: new Date() },
    { user_id: 1, amount: 8.00, category: 'transport', note: 'Minibus fare', recorded_at: new Date() },
    { user_id: 1, amount: 120.00, category: 'food', note: 'Groceries', recorded_at: new Date() },
  ]);

  await knex('income').insert([
    { user_id: 1, amount: 320.00, type: 'daily_wage', expected_amount: 350.00, note: 'Construction, Kabulonga', recorded_at: new Date() },
  ]);

  await knex('savings_goals').insert([
    { user_id: 1, title: 'New TV', target_amount: 3500.00, saved_amount: 1050.00, icon: 'tv' },
    { user_id: 1, title: 'Emergency fund', target_amount: 2000.00, saved_amount: 980.00, icon: 'first-aid-kit' },
    { user_id: 1, title: 'School fees', target_amount: 1200.00, saved_amount: 210.00, icon: 'school' },
  ]);
};
