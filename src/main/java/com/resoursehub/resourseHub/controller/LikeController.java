package com.resoursehub.resourseHub.controller;

import com.resoursehub.resourseHub.model.LikeEntity;
import com.resoursehub.resourseHub.model.User;
import com.resoursehub.resourseHub.service.LikeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{resourceId}")
    public LikeEntity like(@PathVariable Long resourceId, HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        return likeService.likeResource(resourceId, currentUser);
    }

    @DeleteMapping("/{resourceId}")
    public void unlike(@PathVariable Long resourceId, HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        likeService.unlikeResource(resourceId, currentUser);
    }
}