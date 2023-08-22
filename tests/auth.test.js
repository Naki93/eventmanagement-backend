const request = require('supertest');
const app = require('../server'); // Your Express app
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { setup, teardown } = require('../testUtils')
const authRoutes = require('../routes/auth');

let mongod;

describe('Authentication Routes', () => {

  let server;

  beforeAll(async () => {
    jest.setTimeout(30000);
    setup()// Call the setup function from testUtils
    app.use(authRoutes);
    server = app.listen(0);
  });

  afterAll(async () => {
    jest.setTimeout(5000)
    server.close();
    teardown()// Call the teardown function from testUtils
  });

//Test that registers new user
  it('should register a new user', async () => {
    const response = await request(server)
      .post('/auth/register')
      .send({
        username: 'peterpan@example.com',
        password: 'passwordsecure',
        isAdmin: false,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Registration successful');
  });

  //Test log in of existing user
  it('should log in an existing user', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({
        username: 'newuser92@example.com',
        password: 'password899',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('should deny access to admin dashboard for non-admin users', async () => {
    // Log in an existing user to get a valid token
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({
        username: 'jimmy@gmail.com',
        password: '456LmNPqR!',
      });
  
    const token = loginResponse.body.token;
  
    // Now use the valid token to access the admin dashboard
    const response = await request(server)
      .get('/auth/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);
  
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Access forbidden');
  });

  it('should allow an admin to add an event', async () => {
    // Log in an admin user to get a valid token
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({
        username: 'kite@gmail.com',
        password: '896LdB78',
      });
  
    const token = loginResponse.body.token;
  
    // Create a new event object
    const newEvent = {
      eventName: 'New Test Event',
      eventDate: new Date(),
      eventTime: '3:00 PM',
      eventLocation: 'Test Venue',
      eventDescription: 'Test Description',
    };
  
    // Send a POST request to add the event using the admin token
    const response = await request(server)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send(newEvent);
  
    expect(response.statusCode).toBe(201);
    expect(response.body.eventName).toBe(newEvent.eventName);
    
  });

  
  
 
});




