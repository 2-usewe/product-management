const request = require('supertest');

const app = require('./app');



describe('GET /', () => {


    it('should create a product successfully', async () => {
        const productName = 'Test Product';
        const productPrice = 1000;
    
        const response = await request(app)
          .post('/')
          .field('name', productName)
          .field('price', productPrice)
          .attach('image', 'path-to-your-test-image.jpg'); // Replace with the path to your test image
    
        expect(response.status).toBe(201);
        expect(response.body.status).toBe(201);
        expect(response.body.message).toBe('product added successfully.');
        expect(response.body.data).toBeDefined();
      });

    it('should update a product successfully', async () => {
        // Create a new product to update
        const newProduct = await createProduct(); // You should implement a function to create a new product for testing
    
        const updatedName = 'Updated Product Name';
        const updatedPrice = 2000;
    
        const response = await request(app)
          .post('/product/update')
          .send({
            id: newProduct.id, // Use the ID of the product you created
            name: updatedName,
            price: updatedPrice,
          });
    
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(200);
        expect(response.body.message).toBe('product updated successful.');
        expect(response.body.data).toBeDefined();
        expect(response.body.data.name).toBe(updatedName);
        expect(response.body.data.price).toBe(updatedPrice);
      });
    

      
    it('should return products with applied filters and pagination', async () => {
        const page = 2; 
        const limit = 5; 
        const startDate = Math.floor(Date.now() / 1000) - 86400; 
        const endDate = Math.floor(Date.now() / 1000); 
        const search = 'YourSearchTerm'; 
    
        const response = await request(app)
          .get('/product/getAll')
          .query({ page, limit, startDate, endDate, search });
    
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(200);
        expect(response.body.message).toBe('products fetched');
        expect(response.body.data).toBeDefined();
        expect(response.body.totalProducts).toBeDefined();
    
      });
    

  it('GET /product/get-with-pagingnation => array of items', () => {
    const queryParams = {
        page: 1,
        limit: 10,
      };
    return request(app)
      .get('/product/get-with-pagingnation')
      .query(queryParams)
      .expect('Content-Type', /json/)

      .expect(200)

      .then((response) => {
        const responseData = response.body;
        expect(responseData.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),

              name: expect.any(String),

              price: expect.any(Number),
              image:expect.any(String),
              createdAt:expect.any(Number),
              updatedAt:expect.any(Number)
            }),
          ])
        );
      });
  });

  it('should return products matching the search query', async () => {
    const response = await request(app)
      .get('/product/get-by-search')
      .query({ search: 'toy' }); // Replace 'YourSearchTerm' with the search term you want to test

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(200);
    expect(response.body.message).toBe('products fetched');
    expect(response.body.data).toBeDefined();
    expect(response.body.totalProducts).toBeDefined();
  });
  it('should return products within the specified date range', async () => {
    const startDate = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago
    const endDate = Math.floor(Date.now() / 1000); // Current time

    const response = await request(app)
      .get('/product/get-by-range')
      .query({ startDate, endDate });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(200);
    expect(response.body.message).toBe('products fetched');
    expect(response.body.data).toBeDefined();
    expect(response.body.totalProducts).toBeDefined();
  });

  it('should return products in descending order of creation', async () => {
    const response = await request(app)
      .get('/product/get-by-creation');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(200);
    expect(response.body.message).toBe('products fetched');
    expect(response.body.data).toBeDefined();
    expect(response.body.totalProducts).toBeDefined();

    // Check if products are in descending order of creation
    const products = response.body.data;
    for (let i = 0; i < products.length - 1; i++) {
      const currentCreatedAt = new Date(products[i].createdAt);
      const nextCreatedAt = new Date(products[i + 1].createdAt);
      expect(currentCreatedAt >= nextCreatedAt).toBe(true);
    }
  });



//   it('GET / => items by ID', () => {
//     return request(app)
//       .get('/1')

//       .expect('Content-Type', /json/)

//       .expect(200)

//       .then((response) => {
//         expect(response.body).toEqual(
//           expect.objectContaining({
//             id: expect.any(String),

//             name: expect.any(String),

//             inStock: expect.any(Boolean),
//           })
//         );
//       });
//   });

//   it('GET /id => 404 if item not found', () => {
//     return request(app).get('/10000000000').expect(404);
//   });

//   it('POST / => create NEW item', () => {
//     return (
//       request(app)
//         .post('/')

//         // Item send code

//         .send({
//           name: 'Xbox Series X',
//         })

//         .expect('Content-Type', /json/)

//         .expect(201)

//         .then((response) => {
//           expect(response.body).toEqual(
//             expect.objectContaining({
//               name: 'Xbox Series X',

//               inStock: false,
//             })
//           );
//         })
//     );
//   });

//   it('POST / => item name correct data type check', () => {
//     return request(app).post('/').send({ name: 123456789 }).expect(400);
//   });
});