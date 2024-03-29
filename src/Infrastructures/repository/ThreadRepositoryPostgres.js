const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ClientError = require('../../Commons/exceptions/ClientError');
const FoundThread = require('../../Domains/threads/entities/FoundThread');
const CreatedThread = require('../../Domains/threads/entities/CreatedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async createThread(thread) {
    const { title, body, owner } = thread;

    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    return new CreatedThread({ ...result.rows[0] });
  }

  async verifyThreadAvailability(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async findThreadById(threadId) {
    const query = {
      text: `
        SELECT
          threads.id, threads.title, threads.body, threads.created_at as date, users.username
        FROM threads 
        LEFT JOIN users ON threads.owner=users.id
        WHERE threads.id = $1
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return new FoundThread({ ...result.rows[0] });
  }
}

module.exports = ThreadRepositoryPostgres;