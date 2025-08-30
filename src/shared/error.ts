// Legacy type - consider migrating to DomainError
export type AppErrorPayload = {
  message: string;
  code?: string;
  origin?: string;
  stack?: string;
};
