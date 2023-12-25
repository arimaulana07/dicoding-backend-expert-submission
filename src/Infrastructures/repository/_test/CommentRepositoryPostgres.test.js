const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const GetCommentsByThreadId = require('../../../Domains/comments/entities/GetCommentsByThreadId');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment', async () => {
      /* Arrange */
      const addComment = new AddComment({
        content: 'content-123',
        threadId: 'thread-001',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /* Action */
      await commentRepositoryPostgres.addComment(addComment);

      /* Assert */
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      /* Arrange */
      const addComment = new AddComment({
        content: 'content-123',
        threadId: 'thread-001',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      /* Action */
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      /* Assert */
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        owner: 'user-123',
        content: 'content-123'
      }));
    });
  });

  describe('verifyCommentAvailability', () => {
    it('should throw NotFoundError when given comment id is not found', async () => {
      /* Arrange */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      /* Action & Assert */
      await expect(commentRepositoryPostgres.verifyCommentAvailability('notfound-comment'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when given comment id is available', async () => {
      /* Arrange */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const commentId = 'comment-123'
      await CommentsTableTestHelper.addComment({ id: commentId });

      /* Action & Assert */
      await expect(commentRepositoryPostgres.verifyCommentAvailability(commentId))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });
  });

  describe('getCommentByThreadId function', () => {

    it('should persist get comments', async () => {
      /* Arrange  */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const commentPayload = {
        id: 'comment-123',
        content: 'content-test',
        threadId: 'thread-123',
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await CommentsTableTestHelper.addComment(commentPayload);
      
      /* Action */
      const { comments } = await commentRepositoryPostgres.getCommentByThreadId(commentPayload.threadId);

      /* Assert */
      expect(comments).toHaveLength(1);
    });

    it('should return comments correctly', async () => {
      /* Arrange  */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const today = new Date();
      const commentPayload = {
        id: 'comment-123',
        content: 'content-test',
        threadId: 'thread-123',
        owner: 'user-123',
        created_at: today,
        is_delete: false
      };
      await CommentsTableTestHelper.addComment(commentPayload);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'arisaid' });
      
      /* Action */
      const comments = await commentRepositoryPostgres.getCommentByThreadId(commentPayload.threadId);

      /* Assert */
      expect(comments).toStrictEqual(
        new GetCommentsByThreadId([{
          id: 'comment-123',
          content: 'content-test',
          username: 'arisaid',
          date: commentPayload.created_at,
          is_delete: commentPayload.is_delete
        }
      ]));
    });
    
    it('should return comments correctly when is_delete is true', async () => {
      /* Arrange  */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const today = new Date();
      const commentPayload = {
        id: 'comment-123',
        content: 'content-test',
        threadId: 'thread-123',
        owner: 'user-123',
        is_delete: true,
        created_at: today
      };
      await CommentsTableTestHelper.addComment(commentPayload);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'arisaid' });
      
      /* Action */
      const comments = await commentRepositoryPostgres.getCommentByThreadId(commentPayload.threadId);

      /* Assert */
      expect(comments).toStrictEqual(
        new GetCommentsByThreadId(
          [{
            id: 'comment-123',
            content: '**komentar telah dihapus**',
            username: 'arisaid',
            date: commentPayload.created_at,
            is_delete: commentPayload.is_delete
          }]
      ));
    });


  })

  describe('verifyCommentOwner', () => {
    it('should throw AuthorizationError when given owner (userId) is not match with owner in the comment', async () => {
      /* Arrange */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-001' });

      /* Action & Assert */
      await expect(commentRepositoryPostgres.verifyCommentOwner({ commentId: 'comment-123', owner: 'user-002' }))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when given owner (userId) is match with owner in the comment', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({ id: 'comment-234', owner: 'user-002' });

      /* Action & Assert */
      await expect(commentRepositoryPostgres.verifyCommentOwner({ commentId: 'comment-234', owner: 'user-002' }))
        .resolves
        .not
        .toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentById', () => {
    it('should throw NotFoundError when given id is not found', async () => {
      /* Arrange */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      /* Action & Assert */
      await expect(commentRepositoryPostgres.deleteCommentById('comment-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError', async () => {
      /* Arrange */
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      /* Action & Assert */
      await expect(commentRepositoryPostgres.deleteCommentById('comment-123'))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });

    it('should persist deleted comment when thread is deleted', async () => {
      /* Arrange */
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      /* Action */
      await commentRepositoryPostgres.deleteCommentById('comment-123');
      const deletedComment = await CommentsTableTestHelper.findCommentById('comment-123');

      /* Assert */
      expect(deletedComment[0].is_delete).toEqual(true);  
    });
  });
});