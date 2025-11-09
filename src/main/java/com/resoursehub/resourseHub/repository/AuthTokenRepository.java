package com.resoursehub.resourseHub.repository;

import com.resoursehub.resourseHub.model.AuthToken;
import com.resoursehub.resourseHub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {
    Optional<AuthToken> findByToken(String token);
    void deleteByUser(User user);
}
