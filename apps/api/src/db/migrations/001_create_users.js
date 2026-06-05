exports.up = (knex) =>
  knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('name', 100).notNullable();
    t.string('email', 150).notNullable().unique();
    t.string('password_hash').notNullable();
    t.string('currency', 10).notNullable().defaultTo('ZMW');
    t.decimal('monthly_income_goal', 12, 2).nullable();
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('users');
