exports.up = (knex) =>
  knex.schema.createTable('income', (t) => {
    t.increments('id').primary();
    t.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.decimal('amount', 12, 2).notNullable();
    t.enum('type', ['daily_wage', 'contract', 'side_hustle', 'gift', 'other']).notNullable();
    t.decimal('expected_amount', 12, 2).nullable();
    t.string('note', 255).nullable();
    t.datetime('recorded_at').notNullable().defaultTo(knex.fn.now());
    t.timestamps(true, true);
    t.index(['user_id', 'recorded_at']);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('income');
