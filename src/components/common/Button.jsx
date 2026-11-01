export default function Button({ variant = 'primary', type = 'button', className = '', children, ...rest }) {
    const classes = [
        'btn',
        variant === 'ghost' && 'btn--ghost',
        variant === 'danger' && 'btn--danger',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button type={type} className={classes} {...rest}>
            {children}
        </button>
    );
}