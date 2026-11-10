export const ACTION_LABELS = {
    account_created: 'Account created',
    account_activated: 'Account activated',
    account_disabled: 'Account disabled',
    account_enabled: 'Account enabled',
    activation_resent: 'Activation email resent',
    password_reset: 'Password reset',
    access_reset_sent: 'Password reset link sent',
    role_changed: 'Role changed',
    security_settings_changed: 'Security settings changed',
};

export function labelFor(action) {
    if (ACTION_LABELS[action]) return ACTION_LABELS[action];
    const text = String(action).replace(/_/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
}