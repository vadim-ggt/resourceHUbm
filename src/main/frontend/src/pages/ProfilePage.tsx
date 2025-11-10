// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, Chip, Alert, CircularProgress, IconButton, Divider, Container, Paper
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Link as LinkIcon, CalendarToday } from '@mui/icons-material';
import { apiFetch } from '../api';

interface User {
    id: number;
    username: string;
    email: string;
    displayName?: string;
}

interface Resource {
    id: number;
    title: string;
    description: string;
    url: string;
    type: string;
    tags: string[];
    createdAt: string;
    user: User;
}

const CreateResourceDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    onResourceCreated: (resource: Resource) => void;
}> = ({ open, onClose, onResourceCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim() || !url.trim() || !type.trim()) {
            setError('Все поля обязательны для заполнения');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const resourceData = {
                title: title.trim(),
                description: description.trim(),
                url: url.trim(),
                type: type.trim(),
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            };

            const res = await apiFetch('/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resourceData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Ошибка при создании ресурса');
            }

            const newResource = await res.json();
            onResourceCreated(newResource);

            // Сбрасываем форму
            setTitle('');
            setDescription('');
            setUrl('');
            setType('');
            setTags('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Ошибка при создании ресурса');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                textAlign: 'center'
            }}>
                Создать новый ресурс
            </DialogTitle>
            <DialogContent sx={{ p: 3, pl: 6  }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="Название *"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        label="Описание *"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={4}
                        required
                        fullWidth
                        variant="outlined"
                    />
                    <TextField
                        label="URL *"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        fullWidth
                        placeholder="https://example.com"
                        variant="outlined"
                    />
                    <TextField
                        label="Тип *"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                        fullWidth
                        placeholder="Статья, Видео, Книга и т.д."
                        variant="outlined"
                    />
                    <TextField
                        label="Теги (через запятую)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        fullWidth
                        placeholder="программирование, javascript, react"
                        variant="outlined"
                        helperText="Укажите теги через запятую"
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="outlined"
                    sx={{ minWidth: 120 }}
                >
                    Отмена
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                    sx={{ minWidth: 140 }}
                >
                    {loading ? 'Создание...' : 'Создать'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Получаем ресурсы пользователя
                const resourcesRes = await apiFetch('/resources');
                if (!resourcesRes.ok) throw new Error('Не удалось загрузить ресурсы');
                const userResources = await resourcesRes.json();

                setResources(userResources);

                // Предполагаем, что первый ресурс содержит информацию о пользователе
                if (userResources.length > 0) {
                    setUser(userResources[0].user);
                } else {
                    // Если нет ресурсов, можно сделать отдельный запрос для получения информации о пользователе
                    setUser({
                        id: 1,
                        username: 'Пользователь',
                        email: 'user@example.com'
                    });
                }
            } catch (err: any) {
                console.error('Ошибка загрузки профиля:', err);
                setError(err.message || 'Ошибка при загрузке профиля');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleResourceCreated = (newResource: Resource) => {
        setResources(prev => [newResource, ...prev]);
    };

    const handleDeleteResource = async (resourceId: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот ресурс?')) return;

        try {
            const res = await apiFetch(`/resources/${resourceId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Ошибка при удалении ресурса');

            setResources(prev => prev.filter(resource => resource.id !== resourceId));
        } catch (err: any) {
            console.error('Ошибка удаления:', err);
            alert(err.message || 'Ошибка при удалении ресурса');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="contained" onClick={() => window.location.reload()}>
                    Попробовать снова
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Заголовок профиля */}
            <Paper
                elevation={2}
                sx={{
                    p: 4,
                    mb: 4,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}
            >
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                    Мой профиль
                </Typography>
                {user && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {user.username}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {user.email}
                        </Typography>
                        {user.displayName && (
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {user.displayName}
                            </Typography>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Секция с заголовком и кнопкой */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Мои ресурсы
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                    {resources.length} {resources.length === 1 ? 'ресурс' : resources.length < 5 ? 'ресурса' : 'ресурсов'}
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        minWidth: 200
                    }}
                >
                    Создать ресурс
                </Button>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Список ресурсов */}
            {resources.length === 0 ? (
                <Paper
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        backgroundColor: 'grey.50'
                    }}
                >
                    <Box sx={{ mb: 3 }}>
                        <AddIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" color="text.secondary" gutterBottom>
                            У вас пока нет ресурсов
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Создайте свой первый ресурс, чтобы поделиться им с сообществом
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Создать первый ресурс
                    </Button>
                </Paper>
            ) : (
                <Box sx={{ display: 'grid', gap: 3 }}>
                    {resources.map(resource => (
                        <Card
                            key={resource.id}
                            elevation={2}
                            sx={{
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1, mr: 2 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                                            {resource.title}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                                            {resource.description}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <LinkIcon fontSize="small" color="action" />
                                            <Typography
                                                variant="body2"
                                                component="a"
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{
                                                    color: 'primary.main',
                                                    textDecoration: 'none',
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                            >
                                                {resource.url}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                            <Chip
                                                label={resource.type}
                                                color="primary"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                            {resource.tags.map(tag => (
                                                <Chip
                                                    key={tag}
                                                    label={tag}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            ))}
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarToday fontSize="small" color="action" />
                                            <Typography variant="caption" color="text.secondary">
                                                Создан: {new Date(resource.createdAt).toLocaleDateString('ru-RU', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteResource(resource.id)}
                                        sx={{
                                            ml: 1,
                                            '&:hover': { backgroundColor: 'error.light' }
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Диалог создания ресурса */}
            <CreateResourceDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onResourceCreated={handleResourceCreated}
            />
        </Container>
    );
};

export default ProfilePage;