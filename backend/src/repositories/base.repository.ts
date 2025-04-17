interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(query: Partial<T>): Promise<T | null>;
  findAll(query?: Partial<T>): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  search?(query: string): Promise<T[]>;
}

export default IRepository;
