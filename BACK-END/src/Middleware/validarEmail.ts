export function validarEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.com$/i.test(email);
}