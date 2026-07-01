// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
export interface IQuery<TResponse> {
  // Marker interface for Queries
}

export interface IQueryHandler<TQuery extends IQuery<TResponse>, TResponse> {
  execute(query: TQuery): Promise<TResponse>;
}
