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
        password: 'password123',
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
      id: '12345',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      account_created: '2024-01-01T00:00:00Z',
      account_updated: '2024-01-01T00:00:00Z',
    };

    userService.createUser.mockResolvedValue(mockUser);

    await createUserController(req, res);

    // Assert that the response returns a 201 status and the correct user data
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: mockUser.id,
      first_name: mockUser.first_name,
      last_name: mockUser.last_name,
      email: mockUser.email,
      account_created: mockUser.account_created,
      account_updated: mockUser.account_updated,
    });
  });

  test('should return 400 status on error', async () => {
    // Mock createUser to throw an error
    const errorMessage = 'Invalid user data';
    userService.createUser.mockRejectedValue(new Error(errorMessage));

    await createUserController(req, res);

    // Assert that the response returns a 400 status and the error message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});
