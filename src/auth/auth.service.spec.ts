import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service';


const mockFirebaseService = {
  getAuth: jest.fn(),
  getBucket: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let firebaseService: jest.Mocked<typeof mockFirebaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    firebaseService = module.get(FirebaseService) as jest.Mocked<typeof mockFirebaseService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user and set custom claims', async () => {
      const mockCreateUser = jest.fn().mockResolvedValue({ uid: '123' });
      const mockSetCustomUserClaims = jest.fn();
      const mockAuth = {
        createUser: mockCreateUser,
        setCustomUserClaims: mockSetCustomUserClaims,
      };
      firebaseService.getAuth.mockReturnValue(mockAuth as any);

      const email = 'test@example.com';
      const password = 'password123';
      const displayName = 'Test User';
      const phoneNumber = '+541157985656';
      const role = 'user';

      const result = await authService.createUser(email, password, displayName,phoneNumber ,role);

      expect(firebaseService.getAuth).toHaveBeenCalled();
      expect(mockCreateUser).toHaveBeenCalledWith({ email, password, displayName });
      expect(mockSetCustomUserClaims).toHaveBeenCalledWith('123', { role: 'user' });
      expect(result).toEqual({ uid: '123' });
    });
  });

  describe('verifyToken', () => {
    it('should verify the token', async () => {
      const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: '123' });
      const mockAuth = {
        verifyIdToken: mockVerifyIdToken,
      };
      firebaseService.getAuth.mockReturnValue(mockAuth as any);

      const token = 'fake-token';
      const result = await authService.verifyToken(token);

      expect(firebaseService.getAuth).toHaveBeenCalled();
      expect(mockVerifyIdToken).toHaveBeenCalledWith(token);
      expect(result).toEqual({ uid: '123' });
    });
  });

  describe('getStorage', () => {
    it('should return the storage bucket', () => {
      const mockBucket = {};
      firebaseService.getBucket.mockReturnValue(mockBucket);

      const result = authService.getStorage();

      expect(firebaseService.getBucket).toHaveBeenCalled();
      expect(result).toBe(mockBucket);
    });
  });
});
