import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { apiFetch } from "../api";
import { Link } from "react-router-dom";

interface Resource {
    id: number;
    title: string;
    description: string;
    author?: { username: string };
}

const FeedPage: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch("/resources/feed");
                const data = await res.json();
                setResources(data);
            } catch (err) {
                console.error("Ошибка загрузки ленты:", err);
            }
        })();
    }, []);

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
                🔗 Лента ресурсов
            </Typography>
            {resources.map((r) => (
                <Card key={r.id} sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="h6">{r.title}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {r.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Автор: {r.author?.username ?? "Неизвестно"}
                        </Typography>
                        <br />
                        <Button component={Link} to={`/resource/${r.id}`} size="small">
                            Открыть
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default FeedPage;
