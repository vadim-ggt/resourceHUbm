package com.resoursehub.resourseHub.service;

import com.resoursehub.resourseHub.model.LikeEntity;
import com.resoursehub.resourseHub.model.Resource;
import com.resoursehub.resourseHub.model.User;
import com.resoursehub.resourseHub.repository.LikeRepository;
import com.resoursehub.resourseHub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final ResourceRepository resourceRepository;

    @Transactional
    public LikeEntity likeResource(Long resourceId, User currentUser) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        // проверка, если уже лайк
        if (likeRepository.findByUserAndResource(currentUser, resource).isPresent()) {
            throw new RuntimeException("You already liked this resource");
        }

        LikeEntity like = LikeEntity.builder()
                .resource(resource)
                .user(currentUser)
                .createdAt(Instant.now())
                .build();

        return likeRepository.save(like);
    }

    @Transactional
    public void unlikeResource(Long resourceId, User currentUser) {
        // Проверяем, существует ли ресурс
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        // Проверяем, ставил ли пользователь лайк
        LikeEntity like = likeRepository.findByUserAndResource(currentUser, resource)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "You haven't liked this resource"));

        // Если всё ок — удаляем
        likeRepository.delete(like);
    }

}