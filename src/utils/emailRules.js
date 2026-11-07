const EMAIL_PATTERN = /^[^\s@]+@kfupm\.edu\.sa$/i;

export function getEmailError(value) {
    const email = value.trim();
    if (!email) return 'Enter your university email.';
    if (!EMAIL_PATTERN.test(email)) return 'Use your university email ending in @kfupm.edu.sa.';
    return '';
}