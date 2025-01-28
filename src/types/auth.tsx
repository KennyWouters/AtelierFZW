export interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
}

export interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
}