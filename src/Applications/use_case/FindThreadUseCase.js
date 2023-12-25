class FindThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadAvailability(useCasePayload);
    const thread = await this._threadRepository.findThreadById(useCasePayload);
    const comments = await this._commentRepository.getCommentByThreadId(useCasePayload);

    return { ...thread, ...comments }
  }
}

module.exports = FindThreadUseCase;
