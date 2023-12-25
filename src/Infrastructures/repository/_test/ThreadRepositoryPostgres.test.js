const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const FoundThread = require('../../../Domains/threads/entities/FoundThread');

describe('ThreadRepositoryPotsgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist create thread', async () => {
      /* Arrange */
      const createThread = new CreateThread({
        title: 'title-123',
        body: 'body-123',
        owner: 'user-123'
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      /* Action */
      await threadRepositoryPostgres.createThread(createThread);

      /* Assert */
      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return created thread correctly', async () => {
      /* Arrange */
      const thread = new CreateThread({
        title: 'title-123',
        body: 'body-123',
        owner: 'user-123'
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      /* Action */
      const createdThread = await threadRepositoryPostgres.createThread(thread);

      /* Assert */
      expect(createdThread).toStrictEqual(new CreatedThread({
        id: 'thread-123',
        title: 'title-123',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyThreadAvailability', () => {
    it('should throw NotFoundError when given thread id is not found', async () => {
      /* Arrange */
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      /* Action & Assert */
      await expect(threadRepositoryPostgres.verifyThreadAvailability('notfound-thread'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when given thread id is available', async () => {
      /* Arrange */
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const threadId = 'thread-123'
      await ThreadsTableTestHelper.addThread({ id: threadId });

      /* Action & Assert */
      await expect(threadRepositoryPostgres.verifyThreadAvailability(threadId))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });
  });

  describe('findThreadById function', () => {
    it('should throw NotFound when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.findThreadById('thread-001'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return thread object correctly', async () => {
      // Arrange
      const today = new Date();
      const threadPayload = {
        id: 'thread-123',
        title: 'title-123',
        body: 'this is body',
        owner: 'user-123',
        created_at: today,
      }

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'arimaulana' });
      await ThreadsTableTestHelper.addThread(threadPayload);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.findThreadById(threadPayload.id);

      // Assert
      expect(thread).toStrictEqual(new FoundThread({
        id: 'thread-123',
        title: 'title-123',
        body: 'this is body',
        username: 'arimaulana',
        date: today
      }));
    });
  });
});