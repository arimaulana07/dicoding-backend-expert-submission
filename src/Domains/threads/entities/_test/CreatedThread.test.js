const CreatedThread = require('../CreatedThread');

describe('A CreatedThread enitities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: "title test",
      owner: "owner_test",
    };

    expect(() => new CreatedThread(payload)).toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data spesification', () => {
    const payload = {
      id: true,
      title: 123,
      owner: 'user-123'
    };

    expect(() => new CreatedThread(payload)).toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedThread object correctyl', () => {
    const payload = {
      id: "thread-test",
      title: "id-test",
      owner: 'user-123'
    }

    const { id, title, owner } = new CreatedThread(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
