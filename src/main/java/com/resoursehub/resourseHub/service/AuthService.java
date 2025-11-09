package com.resoursehub.resourseHub.service;

import com.resoursehub.resourseHub.model.AuthToken;
import com.resoursehub.resourseHub.model.User;
import com.resoursehub.resourseHub.repository.AuthTokenRepository;
import com.resoursehub.resourseHub.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AuthTokenRepository authTokenRepository;

    public AuthService(UserRepository userRepository, AuthTokenRepository authTokenRepository) {
        this.userRepository = userRepository;
        this.authTokenRepository = authTokenRepository;
    }

    @Transactional
    public User register(String username, String email, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password); // позже заменим на bcrypt
        return userRepository.save(user);
    }


    @Transactional
    public String login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
        }

        // создаём токен
        AuthToken token = new AuthToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setCreatedAt(Instant.now());
        token.setExpiresAt(Instant.now().plusSeconds(3600)); // 1 час

        authTokenRepository.save(token);
        return token.getToken();
    }

    public Optional<User> validateToken(String tokenStr) {
        return authTokenRepository.findByToken(tokenStr)
                .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
                .map(AuthToken::getUser);
    }

    public User getUserFromToken(String token) {
        return authTokenRepository.findByToken(token)
                .map(AuthToken::getUser)
                .orElse(null);
    }

}
