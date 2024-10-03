const { createUserController } = require('../app/controller/userController');
const userService = require('../app/services/userService');

// Mock the createUser function from userService
jest.mock('../app/services/userService', () => ({
  createUser: jest.fn(), // Mock only createUser
}));

describe('User Controller - createUserController', () => {
  let req, res;

  beforeEach(() => {
    // Mock request and response objects
    req = {
      body: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password@123',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('should create a user and return 201 status', async () => {
    // Mock createUser to resolve with a user object
    const mockUser = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password@123'
    };

    userService.createUser.mockResolvedValue(mockUser);

    await createUserController(req, res);
    // Assert that the response returns a 201 status and the correct user data
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      first_name: mockUser.first_name,
      last_name: mockUser.last_name,
      email: mockUser.email,
      account_created: mockUser.account_created,
      account_updated: mockUser.account_updated,
    });
  });
});
