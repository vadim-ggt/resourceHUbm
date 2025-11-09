package com.resoursehub.resourseHub.controller;


import com.resoursehub.resourseHub.model.Comment;
import com.resoursehub.resourseHub.model.User;
import com.resoursehub.resourseHub.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{resourceId}")
    public Comment addComment(@PathVariable Long resourceId,
                              @RequestBody Comment comment,
                              HttpServletRequest request) {

        User currentUser = (User) request.getAttribute("currentUser");
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to comment");
        }

        return commentService.addComment(resourceId, comment, currentUser);
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable Long commentId, HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to delete a comment");
        }
        commentService.deleteComment(commentId, currentUser);
    }

}