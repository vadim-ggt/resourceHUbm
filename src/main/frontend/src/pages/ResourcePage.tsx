import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { Box, Typography, Button } from "@mui/material";

interface Resource {
    id: number;
    title: string;
    description: string;
    author?: { id: number; username: string };
}

const ResourcePage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState<Resource | null>(null);

    const fetchResource = async () => {
        try {
            const res = await apiFetch(`/resources/${id}`);
            const data = await res.json();
            setResource(data);
        } catch (err) {
            console.error("Ошибка загрузки ресурса:", err);
        }
    };

    const handleDelete = async () => {
        try {
            await apiFetch(`/resources/${id}`, { method: "DELETE" });
            alert("Ресурс удалён");
            navigate("/");
        } catch (err) {
            alert("Ошибка удаления (нужна авторизация)");
        }
    };

    useEffect(() => {
        fetchResource();
    }, [id]);

    if (!resource) return <Typography>Загрузка...</Typography>;

    return (
        <Box>
            <Typography variant="h5">{resource.title}</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
                {resource.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Автор: {resource.author?.username}
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Button variant="contained" color="error" onClick={handleDelete}>
                    Удалить
                </Button>
            </Box>
        </Box>
    );
};

export default ResourcePage;
