const CreateThreadUseCase = require('../../../../Applications/use_case/CreateThreadUseCase');
const FindThreadUseCase = require('../../../../Applications/use_case/FindThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.findThreadByIdHandler = this.findThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const createThreadUseCase = this._container.getInstance(CreateThreadUseCase.name);
    const { id: owner } = request.auth.credentials;
    const createdThread = await createThreadUseCase.execute({  ...request.payload, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedThread: createdThread,
      },
    });

    response.code(201);
    return response;
  }

  async findThreadByIdHandler(request, h) {
    const findThreadUseCase = this._container.getInstance(FindThreadUseCase.name);
    const { threadId } = request.params;
    const thread = await findThreadUseCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: {
        thread
      },
    });

    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
