/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  return pgm.addColumn('comments', {
    is_delete: {
      type: 'BOOLEAN',
      default: false,
      notNull: true
    }
  });
};

exports.down = pgm => {
  return pgm.schema.table('comments', (table) => {
    table.dropColumn('is_delete');
  });
};
