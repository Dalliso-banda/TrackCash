exports.up = async (knex) => {
  await knex.schema.createTable('savings_goals', (t) => {
    t.increments('id').primary();
    t.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('title', 100).notNullable();
    t.decimal('target_amount', 12, 2).notNullable();
    t.decimal('saved_amount', 12, 2).notNullable().defaultTo(0);
    t.string('icon', 50).defaultTo('piggy-bank');
    t.date('deadline').nullable();
    t.timestamps(true, true);
  });

  await knex.schema.createTable('savings_deposits', (t) => {
    t.increments('id').primary();
    t.integer('goal_id').unsigned().notNullable().references('id').inTable('savings_goals').onDelete('CASCADE');
    t.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.decimal('amount', 12, 2).notNullable();
    t.string('note', 255).nullable();
    t.timestamps(true, true);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('savings_deposits');
  await knex.schema.dropTableIfExists('savings_goals');
};
