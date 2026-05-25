import { UserNavbar } from './UserNavbar.jsx';

export const UserContainer = ({ onLogout, children }) => {
    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: '#111118',
                color: '#fff',
                fontFamily: "'Inter', sans-serif",
            }}
        >
            <UserNavbar onLogout={onLogout} />
            <main
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '32px 40px',
                    minWidth: 0,
                }}
            >
                {children}
            </main>
        </div>
    );
};