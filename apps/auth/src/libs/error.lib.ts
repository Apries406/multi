export class GRPCError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.code = code;
  }
}
