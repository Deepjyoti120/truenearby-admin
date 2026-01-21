import * as bcrypt from 'bcrypt';

export class UsersService {
  private users = [
    {
      id: 1,
      email: 'admin@test.com',
      password: bcrypt.hashSync('admin123', 10),
    },
  ];

  findByEmail(email: string) {
    console.log('Searching for user with email:', email);
    return this.users.find((u) => u.email === email);
  }
}
