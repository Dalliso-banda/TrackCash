exports.up = (knex) =>
  knex.schema.createTable('budget_items', (t) => {
    t.increments('id').primary();
    t.integer('budget_id').unsigned().notNullable().references('id').inTable('budgets').onDelete('CASCADE');
    t.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('name', 150).notNullable();
    t.decimal('price', 12, 2).notNullable();
    t.integer('quantity').unsigned().notNullable().defaultTo(1);
    t.boolean('purchased').notNullable().defaultTo(false);
    t.string('note', 255).nullable();
    t.timestamps(true, true);
    t.index(['user_id', 'budget_id']);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('budget_items');
