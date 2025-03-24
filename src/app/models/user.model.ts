export interface UserModel {
  name: string;
  lastname: string;
  nick: string;
  age: number | null;
  email: string;
  photoURL: string;
}

export interface UserRegisterModel extends UserModel {
  password: string; // Solo para el registro
}
