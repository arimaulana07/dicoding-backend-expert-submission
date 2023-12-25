const CreateThread = require('../CreateThread');

describe('a CreateThread entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    //Arrange
    const payload = {
      title: 'title test',
      body: 'body test'
    };

    //Action and Assert
    expect(() => new CreateThread(payload)).toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 123,
      body: 'test body',
      owner: true,
    }

    //Action and Assert
    expect(() => new CreateThread(payload)).toThrowError('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateThread object correctly', () => {
    //Arrange
    const payload = {
      title: 'test title',
      body: 'test body',
      owner: 'owner_test'
    };

    // Action
    const { title, body, owner } = new CreateThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});