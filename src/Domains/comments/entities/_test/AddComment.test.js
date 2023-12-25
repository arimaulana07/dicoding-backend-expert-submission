const AddComment = require('../AddComment');

describe('a AddComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    /* Arrange */
    const payload = {
      owner: 'user-123',
      content: 'content-123'
    };

    /* Action and Assert */
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 123,
      owner: true,
      threadId: 123,
    };

    /* Action and Assert */
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  })

  it('should create AddComment object correctly', () => {
    /* Arrange */
    const payload = {
      content: 'content-123',
      owner: 'user-123',
      threadId: 'thread-123',
    }

    /* Action */
    const { content, owner, threadId } = new AddComment(payload)

    /* Assert */
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(threadId).toEqual(payload.threadId);
  });
});