const AddedComment = require('../AddedComment');

describe('A AddedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    /* Arrange */
    const payload = {
      owner: 'user-123',
      content: 'content-123',
    };

    /* Action and Assert */
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 123,
      owner: true,
      id: {},
    };

    /* Action and Assert */
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  })

  it('should create AddComment object correctly', () => {
    /* Arrange */
    const payload = {
      id: 'comment-123',
      content: 'content-123',
      owner: 'user-123',
    }

    /* Action */
    const { id, content, owner } = new AddedComment(payload)

    /* Assert */
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
