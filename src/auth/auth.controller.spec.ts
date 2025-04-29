import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';

// Mock del AuthService
const mockAuthService = {
  createUser: jest.fn(),
  verifyToken: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<typeof mockAuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<typeof mockAuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        role: 'user'
      };

      const mockUser = {
        uid: 'mocked-uid',
        email: createUserDto.email,
        displayName: createUserDto.displayName,
        role: createUserDto.role
      };

      authService.createUser.mockResolvedValue(mockUser as any);

      const result = await authController.register(createUserDto);

      expect(authService.createUser).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.password,
        createUserDto.displayName,
        createUserDto.role
      );
      expect(result).toEqual({
        uid: 'mocked-uid',
        email: createUserDto.email,
        displayName: createUserDto.displayName,
      });
    });

    it('should throw BadRequestException if createUser fails', async () => {
      const createUserDto = {
        email: 'fail@example.com',
        password: 'password123',
        displayName: 'Fail User',
        role: 'user'
      };

      authService.createUser.mockRejectedValue(new Error('User already exists'));

      await expect(authController.register(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyToken', () => {
    it('should verify a token successfully', async () => {
      const idToken = 'fake-token';
      const mockDecodedToken = {
        uid: 'mocked-uid',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      authService.verifyToken.mockResolvedValue(mockDecodedToken as any);

      const result = await authController.verifyToken({ idToken });

      expect(authService.verifyToken).toHaveBeenCalledWith(idToken);
      expect(result).toEqual({
        uid: mockDecodedToken.uid,
        email: mockDecodedToken.email,
        name: mockDecodedToken.name,
        role: mockDecodedToken.role,
      });
    });

    it('should throw BadRequestException if verifyToken fails', async () => {
      const idToken = 'invalid-token';

      authService.verifyToken.mockRejectedValue(new Error('Invalid token'));

      await expect(authController.verifyToken({ idToken })).rejects.toThrow(BadRequestException);
    });
  });
});
