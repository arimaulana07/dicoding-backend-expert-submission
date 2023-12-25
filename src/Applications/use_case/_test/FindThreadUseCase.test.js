const FoundThread = require('../../../Domains/threads/entities/FoundThread');
const GetCommentsByThreadId = require('../../../Domains/comments/entities/GetCommentsByThreadId');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const FindThreadUseCase = require('../FindThreadUseCase');

describe('FindThreadUseCase', () => {
  it('should orchesting the get thread action correctly', async () => {
    /* Arrange */
    const useCasePayload = {
      id: 'thread-123',
    };

    const mockFoundThread = new FoundThread({
      id: useCasePayload.id,
      title: 'title',
      body: 'sebuah body',
      date: 'date-thread',
      username: 'arimaulana',
    });

    const mockGetCommentsByThreadId = new GetCommentsByThreadId([
      {
        id: 'comment-123',
        username: 'arimaulana',
        date: 'date-comment',
        content: 'some comment',
        is_delete: false
      }
    ]);


    /* Creating Dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /* Mock needed functions */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.findThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockFoundThread));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockGetCommentsByThreadId))

    /* Creating use case instance */
    const getThreadUseCase = new FindThreadUseCase({ threadRepository: mockThreadRepository, commentRepository: mockCommentRepository });

    /* Action */
    const getThread = await getThreadUseCase.execute(useCasePayload.id);

    /* Assert */
    const threads = new FoundThread({
      id: useCasePayload.id,
      title: 'title',
      body: 'sebuah body',
      date: 'date-thread',
      username: 'arimaulana',
    });
    const comments = new GetCommentsByThreadId([
      {
        id: 'comment-123',
        username: 'arimaulana',
        date: 'date-comment',
        content: 'some comment',
        is_delete: false
      }
    ]);
    expect(getThread).toStrictEqual({ ...threads, ...comments });
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(useCasePayload.id);
    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload.id);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(useCasePayload.id);
  });
});
