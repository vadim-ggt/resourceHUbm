import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";

interface Resource {
    id: number;
    title: string;
    description: string;
    user?: { username: string };
}

const containerLeftOffset = "320px";
const maxCardWidth = 800;

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
        <Box sx={{ px: 2, py: 4, display: "flex", justifyContent: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "1000px" }}>
                {/* Заголовок */}
                <Card
                    sx={{
                        textAlign: "center",
                        py: 2,
                        background: "linear-gradient(90deg, #6a11cb, #2575fc)",
                        color: "white",
                        maxWidth: maxCardWidth,
                        width: "1000px",
                        ml: containerLeftOffset,
                    }}
                >
                    <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            🔗 Лента ресурсов
                        </Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                            Делитесь полезными материалами и находите новые идеи
                        </Typography>
                    </CardContent>
                </Card>

                {/* Контент */}
                {resources.length === 0 ? (
                    <Typography align="center" sx={{ color: "gray", mt: 4 }}>
                        Здесь пока пусто 😔
                    </Typography>
                ) : (
                    resources.map((r) => (
                        <Box
                            key={r.id}
                            sx={{
                                display: "flex",
                                justifyContent: "flex-start", // карточка прижата к левому краю контейнера
                                width: "1000px",
                                maxWidth: 1000,
                            }}
                        >
                            <Card
                                key={r.id}
                                sx={{
                                    width: "1000px",
                                    maxWidth: maxCardWidth,
                                    p: 2,
                                    borderRadius: 3,
                                    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                                    "&:hover": {
                                        transform: "translateY(-3px)",
                                        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                                    },
                                    ml: "490px",
                                    mb: 3,
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                        <Typography
                                            component={Link}
                                            to={`/resource/${r.id}`}
                                            variant="h6"
                                            sx={{
                                                textDecoration: "none",
                                                color: "#1976d2",
                                                fontWeight: 600,
                                                "&:hover": { textDecoration: "underline" },
                                            }}
                                        >
                                            {r.title}
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: "#333" }}>
                                            {r.description || "Без описания"}
                                        </Typography>

                                        <Typography variant="caption" color="text.secondary">
                                            👤 {r.user?.username ?? "Неизвестный автор"}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default FeedPage;
