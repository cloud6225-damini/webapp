
const { getHealthStatus } = require('../app/controller/healthController');
const healthService = require('../app/services/healthService');

// Mock the healthService module and its healthCheck function
jest.mock('../app/services/healthService', () => ({
  healthCheckAPI: jest.fn(),
}));

describe('Health Controller - getHealthStatus', () => {
    let req, res;

    beforeEach(() => {
        req = {}; // Mock request object
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            setHeader: jest.fn(),
        }; // Mock response object
    });

    test('should return 200 if the database is connected', async () => {
        // Mock the healthCheck to return true (database connected)
        healthService.healthCheckAPI.mockResolvedValue(true);

        await getHealthStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();
        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(res.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
    });

    test('should return 503 if the database is not connected', async () => {
        // Mock the healthCheck to return false (database not connected)
        healthService.healthCheckAPI.mockResolvedValue(false);

        await getHealthStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.send).toHaveBeenCalled();
        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
        expect(res.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
    });
});
