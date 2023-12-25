const DeleteComment = require('../DeleteComment');

describe('a DeleteComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    /* Arrange */
    const payload = {
      threadId: 'thread-123',
      owner: 'user-123',
    };

    /* Action and Assert */
    expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      threadId: true,
      commentId: 123,
      owner: true,
    };

    /* Action and Assert */
    expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  })

  it('should create AddComment object correctly', () => {
    /* Arrange */
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /* Action */
    const { threadId, commentId, owner } = new DeleteComment(payload)

    /* Assert */
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
  });
});