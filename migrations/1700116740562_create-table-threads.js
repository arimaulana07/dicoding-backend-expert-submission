/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('threads', {
    id: {
      type:  'VARCHAR(50)',
      primaryKey: true
    },
    title: {
      type: 'VARCHAR',
      notNull: true,
    },
    body: {
      type: 'TEXT',
      notNull: true
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true
    }
  })
};

exports.down = pgm => {
  pgm.dropTable('threads');
};
