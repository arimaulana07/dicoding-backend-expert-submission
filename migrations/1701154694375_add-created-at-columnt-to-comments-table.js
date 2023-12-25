/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  return pgm.addColumn('comments', {
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
      notNull: true
    }
  });
};

exports.down = pgm => {
  return pgm.schema.table('comments', (table) => {
    table.dropColumn('created_at');
  });
};
