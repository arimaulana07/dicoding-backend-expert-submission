const FoundThread = require('../FoundThread');

describe('a GetThread Entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    /* Arrange */
    const payload = {
      id: 'thread-123',
      title: 'title-123',
      body: 'body',
      username: 'arimaulana',
    }

    /* Action and Assert */
    expect(() => new FoundThread(payload)).toThrowError('FOUND_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: true,
      body: 'body',
      date: [],
      username: {},
    };

    /* Action and Assert */
    expect(() => new FoundThread(payload)).toThrowError('FOUND_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });


  it('should get thread object correctly', () => {
    /* Arrange */
    const payload = {
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: 'date',
      username: 'arimaulana',
    }

    /* Action */
    const { id, title, body, date, username } = new FoundThread(payload);

    /* Assert */
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});