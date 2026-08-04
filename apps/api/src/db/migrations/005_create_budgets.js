exports.up = (knex) =>
  knex.schema.createTable('budgets', (t) => {
    t.increments('id').primary();
    t.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.enum('category', ['food', 'home', 'phone', 'transport', 'savings', 'miscellaneous']).notNullable();
    t.decimal('amount', 12, 2).notNullable();
    t.integer('month').unsigned().notNullable();
    t.integer('year').unsigned().notNullable();
    t.string('note', 255).nullable();
    t.timestamps(true, true);
    t.unique(['user_id', 'category', 'month', 'year']);
    t.index(['user_id', 'year', 'month']);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('budgets');
