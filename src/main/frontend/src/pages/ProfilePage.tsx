// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, Chip, Alert, CircularProgress, IconButton, Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
            <DialogTitle>Создать новый ресурс</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Название"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={3}
                        required
                        fullWidth
                    />
                    <TextField
                        label="URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        fullWidth
                        placeholder="https://example.com"
                    />
                    <TextField
                        label="Тип"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                        fullWidth
                        placeholder="Статья, Видео, Книга и т.д."
                    />
                    <TextField
                        label="Теги (через запятую)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        fullWidth
                        placeholder="программирование, javascript, react"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Отмена</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                >
                    Создать
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
                    // Пока установим базовую информацию из токена или localStorage
                    setUser({
                        id: 1, // Это должно приходить с бекенда
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
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ px: 2, py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ px: 2, py: 4, maxWidth: 1200, margin: '0 auto' }}>
            {/* Заголовок и кнопка создания */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Профиль
                    </Typography>
                    {user && (
                        <Typography variant="body1" color="text.secondary">
                            {user.username} • {user.email}
                        </Typography>
                    )}
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                >
                    Создать ресурс
                </Button>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Мои ресурсы */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Мои ресурсы ({resources.length})
            </Typography>

            {resources.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            У вас пока нет ресурсов
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Создайте свой первый ресурс, чтобы поделиться им с сообществом
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Создать первый ресурс
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {resources.map(resource => (
                        <Card key={resource.id} sx={{ '&:hover': { boxShadow: 3 } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            {resource.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {resource.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                            <Chip
                                                label={resource.type}
                                                color="primary"
                                                variant="outlined"
                                                size="small"
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
                                        <Typography variant="caption" color="text.secondary">
                                            Создан: {new Date(resource.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteResource(resource.id)}
                                        sx={{ ml: 1 }}
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
        </Box>
    );
};

export default ProfilePage;