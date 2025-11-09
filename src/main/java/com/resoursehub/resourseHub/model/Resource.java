package com.resoursehub.resourseHub.model;
import com.resoursehub.resourseHub.enums.ResourceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Заголовок ресурса
    @Column(nullable = false)
    private String title;

    // Краткое описание
    @Column(columnDefinition = "text")
    private String description;

    // Ссылка на внешний источник
    @Column(nullable = false)
    private String url;

    // Тип ресурса — статья, видео, инструмент и т.д.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    // Теги (простая реализация через ElementCollection)
    @ElementCollection
    @CollectionTable(name = "resource_tags", joinColumns = @JoinColumn(name = "resource_id"))
    @Column(name = "tag")
    private List<String> tags;

    // Дата создания
    private Instant createdAt = Instant.now();

    // Кто добавил ресурс
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Комментарии к ресурсу
    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    // Лайки
    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LikeEntity> likes;

}
