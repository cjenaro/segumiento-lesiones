import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
export { bcrypt, jsonwebtoken };

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export function sign(payload: any) {
  return jsonwebtoken.sign(payload, process.env.JWT_SECRET!);
}

export function verify(token: string) {
  return jsonwebtoken.verify(token, process.env.JWT_SECRET!);
}
