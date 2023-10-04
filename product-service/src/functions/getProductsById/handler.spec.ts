
import getBookById from './handler';
import { books } from '../../constants';

describe('getProductById', () => {
  it('should return correct book', async () => {
    const event = {
      pathParameters: {
        productId: 1
      }
    } as any;
    const actual = await getBookById(event);
    expect(actual).toEqual(books[0]);
  });
});