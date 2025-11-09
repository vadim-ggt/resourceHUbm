package com.resoursehub.resourseHub.service;



import com.resoursehub.resourseHub.model.Comment;
import com.resoursehub.resourseHub.model.Resource;
import com.resoursehub.resourseHub.model.User;
import com.resoursehub.resourseHub.repository.CommentRepository;
import com.resoursehub.resourseHub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ResourceRepository resourceRepository;

    public Comment addComment(Long resourceId, Comment comment, User currentUser) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        comment.setAuthor(currentUser);
        comment.setResource(resource);
        comment.setCreatedAt(Instant.now());

        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }


}
