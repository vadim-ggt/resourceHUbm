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
    content: string;
    user: User;
    createdAt: string;
}

interface Like {
    id: number;
    userId: number; // если сервер возвращает userId
    createdAt: string;
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

const ResourcePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [resource, setResource] = useState<Resource | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");

    // допустим, у нас есть текущий пользователь (можно получать из контекста)
    const currentUserId = 3;

    useEffect(() => {
        if (!id) return;

        const fetchResource = async () => {
            try {
                const res = await apiFetch(`/resources/${id}`);
                if (!res.ok) throw new Error("Не удалось загрузить ресурс");
                const data = await res.json();

                // вычисляем количество лайков и проверяем, ставил ли текущий пользователь лайк
                data.likedByCurrentUser = data.likes.some((like: Like) => like.userId === currentUserId);
                setResource(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Ошибка при загрузке ресурса");
            } finally {
                setLoading(false);
            }
        };

        fetchResource();
    }, [id]);

    const handleLike = async () => {
        if (!resource) return;

        try {
            const method = resource.likedByCurrentUser ? "DELETE" : "POST";
            await apiFetch(`/likes/${resource.id}`, { method });

            // после изменения лайка обновляем информацию с сервера
            const updatedResource = await apiFetch(`/resources/${resource.id}`).then(res => res.json());
            updatedResource.likedByCurrentUser = updatedResource.likes.some((like: Like) => like.userId === currentUserId);

            setResource(updatedResource);
        } catch (err) {
            console.error("Ошибка при лайке:", err);
        }
    };

    const handleAddComment = async () => {
        if (!resource || !newComment.trim()) return;
        try {
            const res = await apiFetch(`/comments/${resource.id}`, {
                method: "POST",
                body: JSON.stringify({ content: newComment }),
            });
            const comment = await res.json();
            setResource(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : prev);
            setNewComment("");
        } catch (err) {
            console.error("Ошибка при добавлении комментария:", err);
        }
    };

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>;
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
                        >
                            👍 {resource.likedByCurrentUser ? "Убрать лайк" : "Лайк"}
                        </Button>
                        <Typography>{resource.likes.length} {resource.likes.length === 1 ? "лайк" : "лайков"}</Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Комментарии */}
                    <Typography variant="h6" sx={{ mb: 1 }}>Комментарии</Typography>
                    {resource.comments.map(c => (
                        <Box key={c.id} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: "#f5f5f5" }}>
                            <Typography variant="body2"><strong>{c.user.username}</strong>:</Typography>
                            <Typography variant="body2">{c.content}</Typography>
                            <Typography variant="caption" color="text.secondary">{new Date(c.createdAt).toLocaleString()}</Typography>
                        </Box>
                    ))}

                    {/* Добавление нового комментария */}
                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                        <TextField
                            fullWidth
                            placeholder="Написать комментарий..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            size="small"
                        />
                        <Button variant="contained" onClick={handleAddComment}>Отправить</Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ResourcePage;
