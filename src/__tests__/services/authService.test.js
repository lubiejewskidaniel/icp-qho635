import {
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload,
} from 'firebase/auth';

import {
  login,
  logout,
  sendVerificationEmail,
  reloadCurrentUser,
  resetPassword,
} from '@/services/auth/authService';

import { auth } from '@/lib/firebase/config';

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendEmailVerification: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  reload: jest.fn(),
}));

jest.mock('@/lib/firebase/config', () => ({
  auth: { name: '[DEFAULT]' },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// login
// ---------------------------------------------------------------------------
describe('login', () => {
  it('calls signInWithEmailAndPassword with auth, email, and password', async () => {
    const mockUser = { uid: 'abc', email: 'agent@example.com' };
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

    const result = await login('agent@example.com', 'secret123');

    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'agent@example.com',
      'secret123'
    );
    expect(result).toBe(mockUser);
  });

  it('propagates errors thrown by Firebase', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(
      new Error('auth/wrong-password')
    );

    await expect(login('x@example.com', 'wrong')).rejects.toThrow(
      'auth/wrong-password'
    );
  });
});

// ---------------------------------------------------------------------------
// logout
// ---------------------------------------------------------------------------
describe('logout', () => {
  it('calls signOut with the auth instance', async () => {
    signOut.mockResolvedValueOnce();

    await logout();

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith(auth);
  });
});

// ---------------------------------------------------------------------------
// sendVerificationEmail
// ---------------------------------------------------------------------------
describe('sendVerificationEmail', () => {
  it('throws if user is null', async () => {
    await expect(sendVerificationEmail(null)).rejects.toThrow(
      'No authenticated user.'
    );
  });

  it('does nothing when user.emailVerified is already true', async () => {
    await sendVerificationEmail({ emailVerified: true });

    expect(sendEmailVerification).not.toHaveBeenCalled();
  });

  it('sends the verification email when user is not yet verified', async () => {
    const user = { emailVerified: false };
    sendEmailVerification.mockResolvedValueOnce();

    await sendVerificationEmail(user);

    expect(sendEmailVerification).toHaveBeenCalledTimes(1);
    expect(sendEmailVerification).toHaveBeenCalledWith(user);
  });
});

// ---------------------------------------------------------------------------
// reloadCurrentUser
// ---------------------------------------------------------------------------
describe('reloadCurrentUser', () => {
  it('throws if user is null', async () => {
    await expect(reloadCurrentUser(null)).rejects.toThrow(
      'No authenticated user.'
    );
  });

  it('calls reload and returns the same user object', async () => {
    const user = { uid: 'abc' };
    reload.mockResolvedValueOnce();

    const result = await reloadCurrentUser(user);

    expect(reload).toHaveBeenCalledWith(user);
    expect(result).toBe(user);
  });
});

// ---------------------------------------------------------------------------
// resetPassword
// ---------------------------------------------------------------------------
describe('resetPassword', () => {
  it('throws when email is an empty string', async () => {
    await expect(resetPassword('')).rejects.toThrow('Email is required.');
  });

  it('throws when email is null', async () => {
    await expect(resetPassword(null)).rejects.toThrow('Email is required.');
  });

  it('throws when email is undefined', async () => {
    await expect(resetPassword(undefined)).rejects.toThrow('Email is required.');
  });

  it('calls sendPasswordResetEmail with the auth instance and the email', async () => {
    sendPasswordResetEmail.mockResolvedValueOnce();

    await resetPassword('user@example.com');

    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'user@example.com');
  });

  it('propagates errors thrown by Firebase', async () => {
    sendPasswordResetEmail.mockRejectedValueOnce(
      new Error('auth/user-not-found')
    );

    await expect(resetPassword('ghost@example.com')).rejects.toThrow(
      'auth/user-not-found'
    );
  });
});
