const GetCommentsByThreadId = require('../GetCommentsByThreadId');

describe('a GetCommentsByThreadId entity', () => {
  it('should throw an error when payload did not contain needed property', () => {
    /* Arrange */
    const payload = [
      {
        id: 'comment-123',
        username: 'arimaulana',
        content: 'this is content'
      }
    ];

    /* Action and Assert */
    expect(() => new GetCommentsByThreadId(payload)).toThrowError('GET_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw an error when payload did not meet data type specification', () => {
    /* Arrange */
    const payload = [
      {
        id: true,
        username: [],
        date: 123,
        content: {},
        is_delete: 123
      }
    ];

    /* Action and Assert */
    expect(() => new GetCommentsByThreadId(payload)).toThrowError('GET_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw an error when payload type not an array', () => {
    /* Arrange */
    const payload = {
      id: 'comment-123',
      username: 'arimaulana',
      date: 'date',
      content: 'content',
      is_delete: false
    };

    /* Action and Assert */
    expect(() => new GetCommentsByThreadId(payload)).toThrowError('GET_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should not throw an error when payload is empty array', () => {
    /* Arrange */
    const payload = [];

    /* Action */
    const { comments } = new GetCommentsByThreadId(payload);

    /* Action and Assert */
    expect(comments).toEqual([]);
  });

  it('should create GetComments object correctly', () => {
    /* Arrange */
    const payload = [
      {
        id: 'comment-123',
        username: 'arimaulana',
        date: 'date',
        content: 'content',
        is_delete: false,
      }
    ];

    /* Action */
    const { comments } = new GetCommentsByThreadId(payload);

    /* Assert */
    expect(comments[0].id).toEqual('comment-123');
    expect(comments[0].username).toEqual('arimaulana');
    expect(comments[0].date).toEqual('date');
    expect(comments[0].content).toEqual('content');
  });

  it('should create GetComments object correctly when is_delete is true', () => {
    /* Arrange */
    const payload = [
      {
        id: 'comment-123',
        username: 'arimaulana',
        date: 'date',
        content: 'content',
        is_delete: true
      }
    ];

    /* Action */
    const { comments } = new GetCommentsByThreadId(payload);

    /* Assert */
    expect(comments[0].id).toEqual('comment-123');
    expect(comments[0].username).toEqual('arimaulana');
    expect(comments[0].date).toEqual('date');
    expect(comments[0].content).toEqual('**komentar telah dihapus**');
  });
});
