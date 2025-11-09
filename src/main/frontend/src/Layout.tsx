import { useNavigate } from "react-router-dom";
import { Box, AppBar, Toolbar, Typography, Fab } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

export default function Layout() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f9f3f4",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            {/* ВЕРХНЯЯ ПАНЕЛЬ */}
            <AppBar
                position="fixed"
                sx={{
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "#f7b6c2",
                    boxShadow: "none",
                    height: 50,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Toolbar
                    sx={{
                        width: "100%",
                        maxWidth: 600,
                        margin: "0 auto",
                        minHeight: "50px !important",
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: "#fff",
                            letterSpacing: "0.5px",
                        }}
                    >
                        🐾 ResourceHub
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* ПРОСТРАНСТВО ДЛЯ КОНТЕНТА */}
            <Box
                sx={{
                    flexGrow: 1,
                    width: "100%",
                    mt: "50px",
                    mb: "80px",
                }}
            />

            {/* ПЛАВАЮЩАЯ КНОПКА ДОМОЙ */}
            <Fab
                onClick={() => navigate("/")}
                sx={{
                    position: "fixed",
                    bottom: 20,
                    left: "50%",
                    transform: "translateX(-50%)", // центр по горизонтали
                    backgroundColor: "#f7b6c2",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#f28da2" },
                }}
            >
                <HomeIcon />
            </Fab>
        </Box>
    );
}
