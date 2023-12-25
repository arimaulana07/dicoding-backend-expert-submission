class AddedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, owner, id } = payload;

    this.content = content;
    this.owner = owner;
    this.id = id;
  }

  _verifyPayload({ content, owner, id }) {
    if (!content || !owner || !id) {
      throw new Error('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof id !== 'string') {
      throw new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

}

module.exports = AddedComment;
