const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      /* Arrange */
      const userPayload = {
        username: 'arimaulana',
        password: 'arimaulana_secret',
      };
      const server = await createServer(container);

      //Add User
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

      /* Assert */
      expect(thread.statusCode).toEqual(201);
      expect(threadJson.status).toEqual('success');
      expect(threadJson.data.addedThread).toBeDefined();
    });

    it('should return 400 when request payload not contain needed property', async () => {
      /* Arrange */
      const userPayload = {
        username: 'arimaulana',
        password: 'arimaulana_secret',
      };
      const server = await createServer(container);

      //Create User
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: userPayload.username,
          password: userPayload.password,
          fullname: 'Ari Said Maulana'
        }
      });

      //Create Token Auth
      const token = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: userPayload
      });
      const tokenJson = JSON.parse(token.payload);
      
      /* Action */
      const thread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          body: 'body-123',
        },
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });
      const threadJson = JSON.parse(thread.payload);

      /* Assert */
      expect(thread.statusCode).toEqual(400);
      expect(threadJson.status).toEqual('fail');
      expect(threadJson.message).toEqual('harus mengirimkan title, body');
    });

    it('should response 401 when request header not contain token', async () => {
      /* Arrange */
      const requestPayload = {
        title: 'title-123',
        body: 'body-123',
      };

      const server = await createServer(container);
      /* Action */
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload
      });

      /* Assert */
      expect(response.statusCode).toEqual(401);
    });

    it('should response 401 when request header contain invalid token', async () => {
      /* Arrange */
      const invalidToken = 'invalid_token';
      const requestPayload = {
        title: 'title-123',
        body: 'body-123',
      };

      const server = await createServer(container);


      /* Action */
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${invalidToken}`,
        }
      });

      /* Assert */
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and persisted thread', async () => {
      /* Arrange */
      const server = await createServer(container);

      const userPayload = {
        username: 'arimaulana',
        password: 'arimaulana_secret',
      };

      //Add User
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

      /* Add Thread */
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
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'sebuah komen' },
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });

      /* Action */
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
        headers: {
          authorization: `Bearer ${tokenJson.data.accessToken}`
        }
      });
      const responseJson = JSON.parse(response.payload);

      /* Assert */
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
    });

    it('should response 404 when given thread id is not found', async () => {
      /* Arrange */
      const server = await createServer(container);

      /* Action */
      const response = await server.inject({
        method: 'GET',
        url: '/threads/notfound-thread',
      });
      const responseJson = JSON.parse(response.payload);
      
      /* Assert */
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});