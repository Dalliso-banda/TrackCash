exports.up = (knex) =>
  knex.schema.createTable('expenses', (t) => {
    t.increments('id').primary();
    t.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.decimal('amount', 12, 2).notNullable();
    t.enum('category', ['food', 'home', 'phone', 'transport', 'savings', 'miscellaneous']).notNullable();
    t.string('note', 255).nullable();
    t.datetime('recorded_at').notNullable().defaultTo(knex.fn.now());
    t.timestamps(true, true);
    t.index(['user_id', 'recorded_at']);
    t.index(['user_id', 'category']);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('expenses');
