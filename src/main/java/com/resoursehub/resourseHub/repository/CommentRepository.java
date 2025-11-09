package com.resoursehub.resourseHub.repository;

import com.resoursehub.resourseHub.model.Comment;
import com.resoursehub.resourseHub.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByResource(Resource resource);
}
