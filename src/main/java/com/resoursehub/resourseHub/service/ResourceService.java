package com.resoursehub.resourseHub.service;

import com.resoursehub.resourseHub.model.Resource;
import com.resoursehub.resourseHub.model.User;
import com.resoursehub.resourseHub.repository.ResourceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {


    private final ResourceRepository resourceRepository;

    public Resource createResource(Resource resource, User currentUser) {
        resource.setUser(currentUser);
        resource.setCreatedAt(Instant.now());
        return resourceRepository.save(resource);
    }

    public List<Resource> getMyResources(User currentUser) {
        return resourceRepository.findByUser(currentUser);
    }

    public Resource getResourceById(Long id, User currentUser) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        if (!resource.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this resource");
        }

        return resource;
    }



    @Transactional
    public void deleteResource(Long resourceId, User currentUser) {
        Resource resource = resourceRepository.findByIdAndUserId(resourceId, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        resourceRepository.delete(resource);
    }



    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

}
