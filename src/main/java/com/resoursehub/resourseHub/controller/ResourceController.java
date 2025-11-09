package com.resoursehub.resourseHub.controller;

import com.resoursehub.resourseHub.model.Resource;
import com.resoursehub.resourseHub.model.User;
import com.resoursehub.resourseHub.service.ResourceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping
    public Resource createResource(@RequestBody Resource resource, HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");

        if (currentUser == null) {
            // Если пользователя нет — возвращаем 401
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to create a resource");
        }

        return resourceService.createResource(resource, currentUser);
    }

    @GetMapping
    public List<Resource> getMyResources(HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        return resourceService.getMyResources(currentUser);
    }

    @GetMapping("/{id}")
    public Resource getResourceById(@PathVariable Long id, HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        return resourceService.getResourceById(id, currentUser);
    }



    @DeleteMapping("/{id}")
    public void deleteResource(@PathVariable Long id, HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to delete a resource");
        }

        resourceService.deleteResource(id, currentUser);
    }




    @GetMapping("/feed")
    public List<Resource> getAllResources() {
        return resourceService.getAllResources();
    }


}
