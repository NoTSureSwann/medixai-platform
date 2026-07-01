// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
export interface ICommand<TResponse = void> {
  // Marker interface for Commands
}

export interface ICommandHandler<TCommand extends ICommand<TResponse>, TResponse = void> {
  execute(command: TCommand): Promise<TResponse>;
}
