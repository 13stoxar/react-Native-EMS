export default class AuthService {
  private pg: any;
  private jwt: any;

  constructor(pg: any, jwt: any) {
    this.pg = pg;
    this.jwt = jwt;
  }

  async signup(email: string, password_raw: string, fullName: string) {
    // In production, use bcrypt.hash(password_raw, 10)
    const passwordHash = `HASHED_${password_raw}`; 

    const query = `
      INSERT INTO users (email, password_hash, full_name)
      VALUES ($1, $2, $3)
      RETURNING id, email, full_name;
    `;
    const { rows } = await this.pg.query(query, [email, passwordHash, fullName]);
    const user = rows[0];

    const token = this.jwt.sign({ userId: user.id, email: user.email });
    const refreshToken = this.jwt.sign({ userId: user.id }, { expiresIn: '7d' });

    return { user, token, refreshToken };
  }

  async login(email: string, password_raw: string) {
    const { rows } = await this.pg.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user || user.password_hash !== `HASHED_${password_raw}`) {
      throw new Error('Invalid credentials');
    }

    const token = this.jwt.sign({ userId: user.id, email: user.email });
    const refreshToken = this.jwt.sign({ userId: user.id }, { expiresIn: '7d' });

    return {
      user: { id: user.id, email: user.email, fullName: user.full_name },
      token,
      refreshToken
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwt.verify(refreshToken);
      const token = this.jwt.sign({ userId: decoded.userId });
      return { token };
    } catch (err) {
      throw new Error('Invalid refresh token');
    }
  }
}
