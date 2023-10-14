import { Expose } from 'class-transformer';

export class MetaPagination {
  @Expose()
  totalItems: number;

  @Expose()
  itemCount: number;

  @Expose()
  itemsPerPage: number;

  @Expose()
  totalPages: number;

  @Expose()
  currentPage: number;
}
