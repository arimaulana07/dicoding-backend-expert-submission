const pool = require('../../database/postgres/pool');
const CommentsTableHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableHelper.cleanTable();
    await ThreadsTableHelper.cleanTable();
    await UsersTableHelper.cleanTable();
    await AuthenticationsTableHelper.cleanTable();
  });

  describe('When POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      /* Arrange */
      const requestPayload = {
        content: 'content-123',
      };

      const server = await createServer(container);

      /* Add Users */
      const userPayload = {
        username: 'arimaulana',
        password: 'arimaulana_secret',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
          fullname: 'Ari Said Maulana'
        }
      });

      //Add Token Auth
      const token = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload
      });
      const tokenJson = JSON.parse(token.payload);

      /* Add Threads */
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'title-123',
          body: 'body-123',
        },
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });
      const threadJson = JSON.parse(thread.payload);
      const { id: threadId } = threadJson.data.addedThread;

      /* Action */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });

      /* Assert */
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should return 400 when request payload not contain needed property', async () => {
      /* Arrange */
      const server = await createServer(container);

      /* Add Users */
      const userPayload = {
        username: 'arimaulana',
        password: 'arimaulana_secret',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
          fullname: 'Ari Said Maulana'
        }
      });

      //Add Token Auth
      const token = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload
      });
      const tokenJson = JSON.parse(token.payload);

      /* Add Threads */
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'title-123',
          body: 'body-123',
        },
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });
      const threadJson = JSON.parse(thread.payload);
      const { id: threadId } = threadJson.data.addedThread;

      /* Action */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {},
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });

      /* Assert */
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan content');
    });

    it('should return 400 when request payload not meed data type specification', async () => { 
      /* Arrange */
      const server = await createServer(container);

      /* Add Users */
      const userPayload = {
        username: 'arimaulana',
        password: 'arimaulana_secret',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
          fullname: 'Ari Said Maulana'
        }
      });

      //Add Token Auth
      const token = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload
      });
      const tokenJson = JSON.parse(token.payload);

      /* Add Threads */
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'title-123',
          body: 'body-123',
        },
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });
      const threadJson = JSON.parse(thread.payload);
      const { id: threadId } = threadJson.data.addedThread;

      /* Action */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: true },
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });

      /* Assert */
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('content harus string');
    });

    it('should return 404 when given threadId not found', async () => {
      /* Arrange */
      const server = await createServer(container);

      /* Add Users */
      const userPayload = {
        username: 'arimaulana',
        password: 'arimaulana_secret',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
          fullname: 'Ari Said Maulana'
        }
      });

      //Add Token Auth
      const token = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload
      });
      const tokenJson = JSON.parse(token.payload);

      /* Action */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-001/comments`,
        payload: { content: 'content-123' },
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });

      /* Assert */
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should return 401 when request header not contain token', async () => {
      /* Arrange */
      const requestPayload = {
        content: 'content-123',
      };

      const server = await createServer(container);

      /* Add Users */
      const userPayload = {
        username: 'arimaulana',
        password: 'arimaulana_secret',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
          fullname: 'Ari Said Maulana'
        }
      });

      //Add Token Auth
      const token = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload
      });
      const tokenJson = JSON.parse(token.payload);

      /* Add Threads */
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'title-123',
          body: 'body-123',
        },
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });
      const threadJson = JSON.parse(thread.payload);
      const { id: threadId } = threadJson.data.addedThread;

      /* Action */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload
      });

      /* Assert */
      expect(response.statusCode).toEqual(401);
    });

    it('should return 401 when request header contain invalid token', async () => {
      /* Arrange */
      const requestPayload = {
        content: 'content-123',
      };

      const server = await createServer(container);

      /* Add Users */
      const userPayload = {
        username: 'arimaulana',
        password: 'arimaulana_secret',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
          fullname: 'Ari Said Maulana'
        }
      });

      //Add Token Auth
      const token = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload
      });
      const tokenJson = JSON.parse(token.payload);

      /* Add Threads */
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'title-123',
          body: 'body-123',
        },
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });
      const threadJson = JSON.parse(thread.payload);
      const { id: threadId } = threadJson.data.addedThread;

      /* Action */
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          authorization: 'Bearer some_invalid_token'
        }
      });

      /* Assert */
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('When DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200', async () => {
      /* Arrange */
      const requestPayload = {
        content: 'content-123',
      };

      const server = await createServer(container);

      /* Add Users */
      const userPayload = {
        username: 'arimaulana',
        password: 'arimaulana_secret',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
          fullname: 'Ari Said Maulana'
        }
      });

      //Add Token Auth
      const token = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload
      });
      const tokenJson = JSON.parse(token.payload);

      /* Add Threads */
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'title-123',
          body: 'body-123',
        },
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });
      const threadJson = JSON.parse(thread.payload);
      const { id: threadId } = threadJson.data.addedThread;

      /* Add Comment */
      const comment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });
      const commentJson = JSON.parse(comment.payload);
      const { id: commentId } = commentJson.data.addedComment;

      /* Action */
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);

      /* Assert */
      expect(response.statusCode).toEqual(200);
      expect(responseJson.data).toEqual({ status: 'success' })
    });

    it('should response 404 when given threadId is invalid or not found', async () => {
      /* Arrange */
      const server = await createServer(container);

      /* Add Users */
      const userPayload = {
        username: 'arimaulana',
        password: 'arimaulana_secret',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
          fullname: 'Ari Said Maulana'
        }
      });

      //Add Token Auth
      const token = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload
      });
      const tokenJson = JSON.parse(token.payload);

      /* Action */
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/notfound-thread/comments/comment-123',
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);

      /* Assert */
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when given commentId is invalid or not found', async () => {
      /* Arrange */
      const server = await createServer(container);

      /* Add Users */
      const userPayload = {
        username: 'arimaulana',
        password: 'arimaulana_secret',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
          fullname: 'Ari Said Maulana'
        }
      });

      //Add Token Auth
      const token = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload
      });
      const tokenJson = JSON.parse(token.payload);

      /* Add Threads */
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'title-123',
          body: 'body-123',
        },
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });
      const threadJson = JSON.parse(thread.payload);
      const { id: threadId } = threadJson.data.addedThread;

      /* Action */
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/notfound-comment`,
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);

      /* Assert */
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komen tidak ditemukan');
    });

    it('should response 401 when request header not contain token', async () => {
      /* Arrange */
      const server = await createServer(container);
      await ThreadsTableHelper.addThread({ id: 'thread-123' });
      await CommentsTableHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });

      /* Action */
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
      });

      /* Assert */
      expect(response.statusCode).toEqual(401);
    });

    it('should response 401 when request header contain invalid token', async () => {
      /* Arrange */
      const server = await createServer(container);
      await ThreadsTableHelper.addThread({ id: 'thread-123' });
      await CommentsTableHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });

      /* Action */
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          authorization: 'Bearer invalid_token',
        },
      });

      /* Assert */
      expect(response.statusCode).toEqual(401);
    });

    it('should response 403 when given owner (userId) is not the comment owner', async () => {
      /* Arrange */
      const server = await createServer(container);

      //add user-a
      await UsersTableHelper.addUser({ id: 'user-a', username: 'user_a', password: 'secret' });

      //add user-b
      const userPayload = {
        username: 'user_b',
        password: 'secret',
      };
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
          fullname: 'Ari Said Maulana'
        }
      });

      // Create token for user-b
      const tokenB = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'user_b',
          password: 'secret'
        }
      });
      const tokenBJson = JSON.parse(tokenB.payload);

      //Add Thread
      await ThreadsTableHelper.addThread({ id: 'thread-123', owner: 'user-a' });

      //Add Comment using user-a
      await CommentsTableHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-a' });

      /* Action */
      //trying to delete comment with user-b
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          authorization: `Bearer ${tokenBJson.data.accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);

      /* Assert */
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini');
    });
  });


});
