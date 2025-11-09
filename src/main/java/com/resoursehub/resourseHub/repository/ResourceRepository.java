package com.resoursehub.resourseHub.repository;

import com.resoursehub.resourseHub.model.Resource;
import com.resoursehub.resourseHub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByUser(User user);
    Optional<Resource> findByIdAndUserId(Long id, Long userId);
}