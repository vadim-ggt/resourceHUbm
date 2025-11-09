import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

function HomePage() {
    return <h2>🏠 Добро пожаловать домой!</h2>;
}

function MyResourcesPage() {
    return <h2>📚 Ваши ресурсы</h2>;
}

function ProfilePage() {
    return <h2>😺 Ваш профиль</h2>;
}

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/*" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="resources" element={<MyResourcesPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>
            </Routes>
        </Router>
    );
}
