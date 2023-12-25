const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CreateThreadUseCase = require('../CreateThreadUseCase');


describe('CreateThreadUseCase', () => {
  it('should orchesting the create thread action correctly', async () => {
    /* Arrange */
    const useCasePayload = {
      title: 'title-123',
      body: 'body-123',
      owner: 'owner-123'
    };

    const mockCreatedThread = new CreatedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner
    });

    /* Creating Dependency of Use Case */
    const mockThreadRepository = new ThreadRepository();

    /* Mocking Needed Function */
    mockThreadRepository.createThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockCreatedThread));

    /* Creating use case instance */
    const getThreadUseCase = new CreateThreadUseCase({ threadRepository: mockThreadRepository });


    /* Action */
    const createdThread = await getThreadUseCase.execute(useCasePayload);

    /* Assert */
    expect(createdThread).toStrictEqual(new CreatedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner
    }));
    expect(mockThreadRepository.createThread).toBeCalledWith(new CreateThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));
  });
});