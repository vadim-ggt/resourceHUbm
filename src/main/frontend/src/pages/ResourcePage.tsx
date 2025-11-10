// src/pages/ResourcePage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Box, Card, CardContent, Typography, Chip, Link, CircularProgress, Alert, Button, Divider, TextField
} from "@mui/material";
import { apiFetch } from "../api";

interface User {
    id: number;
    username: string;
}

interface Comment {
    id: number;
    text: string;
    author: User;
    createdAt: string;
}

interface Like {
    id: number;
    createdAt: string;
    user: User;
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
    comments: Comment[];
    likes: Like[];
    likedByCurrentUser?: boolean;
}

// Функция для получения текущего пользователя из первого ресурса
const getCurrentUserFromResources = async (): Promise<User | null> => {
    if (!localStorage.getItem("token")) {
        return null;
    }

    try {
        // Получаем список ресурсов пользователя чтобы узнать его ID
        const res = await apiFetch('/resources');
        if (res.ok) {
            const resources = await res.json();
            if (resources.length > 0 && resources[0].user) {
                return resources[0].user;
            }
        }
    } catch (error) {
        console.error("Error getting current user from resources:", error);
    }

    return null;
};

const ResourcePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [resource, setResource] = useState<Resource | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [likeLoading, setLikeLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userLoading, setUserLoading] = useState(true);

    useEffect(() => {
        // Получаем текущего пользователя при загрузке компонента
        const fetchCurrentUser = async () => {
            const user = await getCurrentUserFromResources();
            console.log("Текущий пользователь:", user);
            setCurrentUser(user);
            setUserLoading(false);
        };

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (!id || userLoading) return;

        const fetchResource = async () => {
            try {
                const res = await apiFetch(`/resources/${id}`);
                if (!res.ok) throw new Error("Не удалось загрузить ресурс");
                const data = await res.json();

                console.log("Полученный ресурс:", data);
                console.log("Текущий пользователь для проверки лайков:", currentUser);

                // Определяем, поставил ли текущий пользователь лайк
                const currentUserId = currentUser?.id;
                if (currentUserId) {
                    data.likedByCurrentUser = data.likes?.some((like: Like) =>
                        like.user?.id === currentUserId
                    ) || false;
                    console.log("Лайк текущего пользователя:", data.likedByCurrentUser);
                } else {
                    data.likedByCurrentUser = false;
                }

                setResource(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Ошибка при загрузке ресурса");
            } finally {
                setLoading(false);
            }
        };

        fetchResource();
    }, [id, currentUser, userLoading]);

    const handleLike = async () => {
        if (!resource || !currentUser) {
            setError("Необходимо авторизоваться для оценки ресурсов");
            return;
        }

        setLikeLoading(true);
        try {
            const method = resource.likedByCurrentUser ? "DELETE" : "POST";
            console.log("Отправка лайка:", method, "для ресурса:", resource.id, "пользователем:", currentUser.id);

            const res = await apiFetch(`/likes/${resource.id}`, { method });

            if (!res.ok) {
                throw new Error("Ошибка при изменении лайка");
            }

            // Оптимистичное обновление UI
            setResource(prev => {
                if (!prev) return prev;

                if (method === "POST") {
                    // Добавляем лайк
                    const newLike: Like = {
                        id: Date.now(),
                        createdAt: new Date().toISOString(),
                        user: currentUser
                    };
                    return {
                        ...prev,
                        likedByCurrentUser: true,
                        likes: [...prev.likes, newLike]
                    };
                } else {
                    // Удаляем лайк текущего пользователя
                    return {
                        ...prev,
                        likedByCurrentUser: false,
                        likes: prev.likes.filter(like => like.user?.id !== currentUser.id)
                    };
                }
            });

            // Фоновая синхронизация с сервером
            setTimeout(async () => {
                try {
                    const updatedRes = await apiFetch(`/resources/${resource.id}`);
                    const updatedResource = await updatedRes.json();

                    // Обновляем состояние лайка текущего пользователя
                    updatedResource.likedByCurrentUser = updatedResource.likes?.some((like: Like) =>
                        like.user?.id === currentUser.id
                    ) || false;

                    setResource(updatedResource);
                } catch (err) {
                    console.error("Ошибка при синхронизации:", err);
                }
            }, 300);

        } catch (err: any) {
            console.error("Ошибка при лайке:", err);
            setError(err.message || "Не удалось обновить лайк");

            // Откатываем изменения в случае ошибки
            setResource(prev => prev ? { ...prev } : prev);
        } finally {
            setLikeLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!resource || !newComment.trim()) return;

        if (!currentUser) {
            setError("Необходимо авторизоваться для добавления комментариев");
            return;
        }

        try {
            console.log("Отправка комментария:", { text: newComment });

            const res = await apiFetch(`/comments/${resource.id}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: newComment
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Ошибка при добавлении комментария");
            }

            const serverComment = await res.json();
            console.log("Создан комментарий:", serverComment);

            // Добавляем комментарий в список
            setResource(prev => prev ? {
                ...prev,
                comments: [...prev.comments, serverComment]
            } : prev);
            setNewComment("");
        } catch (err: any) {
            console.error("Ошибка при добавлении комментария:", err);
            setError(err.message || "Не удалось добавить комментарий");
        }
    };

    // Проверяем авторизацию для отображения интерфейса
    const isAuthenticated = !!currentUser;

    if (loading || userLoading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!resource) return <Alert severity="info">Ресурс не найден</Alert>;

    return (
        <Box sx={{ px: 2, py: 4, display: "flex", justifyContent: "center" }}>
            <Card sx={{ width: "100%", maxWidth: 800 }}>
                <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>{resource.title}</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{resource.description}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}><strong>Тип:</strong> {resource.type}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Ссылка:</strong>{" "}
                        <Link href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</Link>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}><strong>Автор:</strong> {resource.user.username}</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}><strong>Дата создания:</strong> {new Date(resource.createdAt).toLocaleString()}</Typography>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                        {resource.tags.map(tag => <Chip key={tag} label={tag} color="primary" variant="outlined" size="small" />)}
                    </Box>

                    {/* Лайки */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Button
                            variant={resource.likedByCurrentUser ? "contained" : "outlined"}
                            color="primary"
                            onClick={handleLike}
                            disabled={likeLoading || !isAuthenticated}
                        >
                            {likeLoading ? <CircularProgress size={24} /> : "👍"}
                            {resource.likedByCurrentUser ? " Убрать лайк" : " Лайк"}
                        </Button>
                        <Typography>
                            {resource.likes?.length || 0} {resource.likes?.length === 1 ? "лайк" : "лайков"}
                        </Typography>
                        {!isAuthenticated && (
                            <Typography variant="caption" color="text.secondary">
                                (Войдите, чтобы оценить)
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Комментарии */}
                    <Typography variant="h6" sx={{ mb: 1 }}>Комментарии ({resource.comments?.length || 0})</Typography>

                    {resource.comments?.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Пока нет комментариев. Будьте первым!
                        </Typography>
                    ) : (
                        resource.comments?.map(c => (
                            <Box key={c.id} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: "#f5f5f5" }}>
                                <Typography variant="body2"><strong>{c.author.username}</strong>:</Typography>
                                <Typography variant="body2">{c.text}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(c.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                        ))
                    )}

                    {/* Добавление нового комментария */}
                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                        <TextField
                            fullWidth
                            placeholder={isAuthenticated ? "Написать комментарий..." : "Войдите, чтобы комментировать"}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            size="small"
                            disabled={!isAuthenticated}
                        />
                        <Button
                            variant="contained"
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || !isAuthenticated}
                        >
                            Отправить
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ResourcePage;