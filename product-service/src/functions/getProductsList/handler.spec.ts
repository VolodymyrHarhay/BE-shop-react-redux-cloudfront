
import getBooksList from './handler';
import { books } from '../../constants';

describe('getProductList', () => {
  it('should return list of books', async () => {
    const actual = await getBooksList();
    expect(actual).toHaveLength(6);
    expect(actual).toEqual(books);
  });
});