class CreatedThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, id, owner } = payload;

    this.title = title;
    this.id = id;
    this.owner = owner;
  }

  _verifyPayload({ title, id, owner }) {
    if (!title || !id || !owner) {
      throw new Error('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof id !== 'string' || typeof owner !== 'string') {
      throw new Error('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

  }
}

module.exports = CreatedThread;
