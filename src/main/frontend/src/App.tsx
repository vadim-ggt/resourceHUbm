
import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
} from "react-router-dom";
import {
    Box, AppBar, Toolbar, Typography, Button, Fab, Dialog, DialogTitle, DialogContent, TextField, DialogActions
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import FeedPage from './pages/FeedPage';
import ResourcePage from './pages/ResourcePage';
import ProfilePage from './pages/ProfilePage';



interface LoginDialogProps {
    open: boolean;
    onClose: () => void;
    onLogin: (username: string, password: string) => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Вход</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField label="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} />
                <TextField label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onLogin(username, password)}>Войти</Button>
                <Button onClick={onClose}>Отмена</Button>
            </DialogActions>
        </Dialog>
    );
};




interface RegisterDialogProps {
    open: boolean;
    onClose: () => void;
    onRegister: (username: string, email: string, password: string) => void;
}

const RegisterDialog: React.FC<RegisterDialogProps> = ({ open, onClose, onRegister }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Регистрация</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField label="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} />
                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onRegister(username, email, password)}>Зарегистрироваться</Button>
                <Button onClick={onClose}>Отмена</Button>
            </DialogActions>
        </Dialog>
    );
};



const App: React.FC = () => {
    const [openLogin, setOpenLogin] = useState(false);
    const [openRegister, setOpenRegister] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    // 🧠 При запуске читаем токен из localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            setToken(savedToken);
        }
    }, []);

    const handleLogin = async (username: string, password: string) => {
        try {
            const res = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) throw new Error('Ошибка авторизации');
            const data = await res.json();

            // 💾 Сохраняем токен в localStorage
            localStorage.setItem("token", data.token);
            setToken(data.token);

            setOpenLogin(false);
        } catch (e) {
            alert('Неверные данные');
        }
    };

    const handleRegister = async (username: string, email: string, password: string) => {
        try {
            const res = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            if (!res.ok) throw new Error('Ошибка регистрации');
            alert('Регистрация прошла успешно!');
            setOpenRegister(false);
            setOpenLogin(true);
        } catch (e) {
            alert('Ошибка регистрации');
        }
    };

    // 🚪 Выход (очистка токена)
    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return (
        <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {/* Верхняя панель */}
                <AppBar position="fixed" sx={{ backgroundColor: '#2f3640' }}>
                    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            ResourceHub
                        </Typography>
                        {token ? (
                            <Box>
                                <Button color="inherit" component={Link} to="/profile" startIcon={<AccountCircleIcon />}>
                                    Профиль
                                </Button>
                                <Button color="inherit" onClick={handleLogout}>
                                    Выйти
                                </Button>
                            </Box>
                        ) : (
                            <Box>
                                <Button color="inherit" onClick={() => setOpenLogin(true)}>Войти</Button>
                                <Button color="inherit" onClick={() => setOpenRegister(true)}>Регистрация</Button>
                            </Box>
                        )}
                    </Toolbar>
                </AppBar>

                {/* Контент */}
                <Box component="main" sx={{ flexGrow: 1, mt: 8, mb: 8, px: 2 }}>
                    <Routes>
                        <Route path="/" element={<FeedPage />} />
                        <Route path="/resource/:id" element={<ResourcePage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Routes>
                </Box>

                {/* Нижняя плавающая кнопка */}
                <Fab
                    color="primary"
                    component={Link}
                    to="/"
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1300,
                    }}
                >
                    <HomeIcon />
                </Fab>

                {/* Модалки логина и регистрации */}
                <LoginDialog
                    open={openLogin}
                    onClose={() => setOpenLogin(false)}
                    onLogin={handleLogin}
                />
                <RegisterDialog
                    open={openRegister}
                    onClose={() => setOpenRegister(false)}
                    onRegister={handleRegister}
                />
            </Box>
        </Router>
    );
};

export default App;
