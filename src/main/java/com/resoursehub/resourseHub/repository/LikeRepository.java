package com.resoursehub.resourseHub.repository;

import com.resoursehub.resourseHub.model.LikeEntity;
import com.resoursehub.resourseHub.model.Resource;
import com.resoursehub.resourseHub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<LikeEntity, Long> {
    Optional<LikeEntity> findByUserAndResource(User user, Resource resource);
    void deleteByUserAndResource(User user, Resource resource);
}