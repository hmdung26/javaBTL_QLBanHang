package com.sales.management.service.impl;

import com.sales.management.dto.request.CategoryRequestDTO;
import com.sales.management.dto.response.CategoryResponseDTO;
import com.sales.management.entity.Category;
import com.sales.management.exception.ResourceNotFoundException;
import com.sales.management.exception.BadRequestException;
import com.sales.management.repository.CategoryRepository;
import com.sales.management.service.CategoryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponseDTO createCategory(CategoryRequestDTO requestDTO) {
        Category category = Category.builder()
                .name(requestDTO.getName())
                .description(requestDTO.getDescription())
                .parent(findOptionalCategory(requestDTO.getParentId()))
                .build();

        return toResponseDTO(categoryRepository.save(category));
    }

    @Override
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public CategoryResponseDTO getCategoryById(Long id) {
        return toResponseDTO(findCategoryById(id));
    }

    @Override
    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO requestDTO) {
        Category category = findCategoryById(id);
        category.setName(requestDTO.getName());
        category.setDescription(requestDTO.getDescription());
        if (id.equals(requestDTO.getParentId())) {
            throw new BadRequestException("Category cannot be its own parent");
        }
        category.setParent(findOptionalCategory(requestDTO.getParentId()));

        return toResponseDTO(categoryRepository.save(category));
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = findCategoryById(id);
        category.getProducts().forEach(product -> product.setCategory(null));
        category.getChildren().forEach(child -> child.setParent(null));
        categoryRepository.delete(category);
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private Category findOptionalCategory(Long id) {
        return id == null ? null : findCategoryById(id);
    }

    private CategoryResponseDTO toResponseDTO(Category category) {
        Category parent = category.getParent();
        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentId(parent != null ? parent.getId() : null)
                .parentName(parent != null ? parent.getName() : null)
                .createdAt(category.getCreatedAt())
                .build();
    }
}
