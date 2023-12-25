class GetCommentsByThreadId {
  constructor(payload) {
    this._verifyPayload(payload);
    this.comments = payload.map(({ id, username, date, content, is_delete }) => {
      if (is_delete) content = '**komentar telah dihapus**';
      return { id, username, date, content }
    });
  }

  _verifyPayload(payload) {
    if (!Array.isArray(payload)) {
      throw new Error('GET_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (payload.length > 0) {
      payload.forEach(({ id, username, date, content, is_delete }) => {
        if (!id || !username || !date || !content || is_delete === undefined) {
          throw new Error('GET_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (
          typeof id !== 'string'            ||
          typeof username !== 'string'      ||
          typeof content !== 'string'       ||
          typeof is_delete !== 'boolean'    ||
          !date instanceof Date         
        ) {
          throw new Error('GET_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
      });
    }
  }
}

module.exports = GetCommentsByThreadId;
