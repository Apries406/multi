import * as crypto from 'crypto';

// 生成随机盐
export function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

export function encodePassword(password: string, salt: string): string {
  const hash = crypto.createHash('md5');
  // 拼接密码和盐
  const data = password + salt;
  hash.update(data);

  return hash.digest('hex');
}

export function verifyPassword(row: string, salt: string, pwd: string) {
  const encodedRow = encodePassword(row, salt);
  return encodedRow === pwd;
}
