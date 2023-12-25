const InvariantError = require('../../Commons/exceptions/InvariantError');
const AuthorizationtError = require('../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const GetCommentByThreadId = require('../../Domains/comments/entities/GetCommentsByThreadId'); 
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const { content, threadId, owner } = comment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING content, owner, id',
      values: [id, content, threadId, owner]
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND is_delete = false',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komen tidak ditemukan');
    }
  }

  // async findCommentById(commentId) {
  //   const query = {
  //     text: 'SELECT * FROM comments WHERE id = $1 AND is_delete = false',
  //     values: [commentId],
  //   };

  //   const result = await this._pool.query(query);

  //   if (!result.rowCount) {
  //     throw new NotFoundError('komen tidak ditemukan');
  //   }

  //   return result.rows[0];
  // }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `
        SELECT comments.id, comments.content, comments.created_at as date, comments.is_delete, users.username
        FROM comments
        LEFT JOIN users ON comments.owner=users.id
        WHERE thread_id = $1
        ORDER BY comments.created_at ASC
      `,
      values: [threadId],
    }

    const result = await this._pool.query(query);
    return new GetCommentByThreadId(result.rows);
  }

  async verifyCommentOwner({ commentId, owner }) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId]
    };

    const result = await this._pool.query(query);
    const comment = result.rows[0];
    if (comment.owner !== owner) {
      throw new AuthorizationtError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Komen Tidak ditemukan');
    }
  }
}

module.exports = CommentRepositoryPostgres;
