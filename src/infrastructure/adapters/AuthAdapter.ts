export interface AuthUser {
  id: string;
  username: string;
  role: 'admin';
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: AuthUser;
}

export class AuthAdapter {
  private readonly ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
  private readonly TOKEN_KEY = 'cocuk-bahcem-auth-token';
  private readonly TOKEN_EXPIRY_HOURS = 24;

  async login(password: string): Promise<AuthToken | null> {
    if (password !== this.ADMIN_PASSWORD) {
      return null;
    }

    const user: AuthUser = {
      id: 'admin',
      username: 'admin',
      role: 'admin'
    };

    const token: AuthToken = {
      token: this.generateToken(),
      expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
      user
    };

    // Store token in localStorage
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(token));

    return token;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const tokenData = localStorage.getItem(this.TOKEN_KEY);

    if (!tokenData) {
      return null;
    }

    try {
      const token: AuthToken = JSON.parse(tokenData);

      // Check if token is expired
      if (new Date(token.expiresAt) < new Date()) {
        await this.logout();
        return null;
      }

      return token.user;
    } catch {
      // Invalid token data
      await this.logout();
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  async refreshToken(): Promise<AuthToken | null> {
    const user = await this.getCurrentUser();

    if (!user) {
      return null;
    }

    // Generate new token
    const token: AuthToken = {
      token: this.generateToken(),
      expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
      user
    };

    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(token));
    return token;
  }

  private generateToken(): string {
    // Simple token generation for development
    // In production, use proper JWT or similar
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return btoa(`${timestamp}-${random}`);
  }

  // Utility method for route guards
  requireAuth(): Promise<AuthUser> {
    return new Promise(async (resolve, reject) => {
      const user = await this.getCurrentUser();

      if (user) {
        resolve(user);
      } else {
        reject(new Error('Authentication required'));
      }
    });
  }
}