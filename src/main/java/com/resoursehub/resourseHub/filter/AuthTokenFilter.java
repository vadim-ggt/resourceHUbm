package com.resoursehub.resourseHub.filter;

import com.resoursehub.resourseHub.model.User;
import com.resoursehub.resourseHub.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AuthTokenFilter extends HttpFilter {

    private final AuthService authService;

    @Override
    protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7); // убираем "Bearer "

            User user = authService.getUserFromToken(token);
            if (user != null) {
                request.setAttribute("currentUser", user);
            }
        }

        chain.doFilter(request, response);
    }
}