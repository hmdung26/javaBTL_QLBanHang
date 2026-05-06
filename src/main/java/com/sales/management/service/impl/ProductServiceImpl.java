package com.sales.management.service.impl;

import com.sales.management.dto.request.ProductRequestDTO;
import com.sales.management.dto.response.ProductResponseDTO;
import com.sales.management.entity.Category;
import com.sales.management.entity.Product;
import com.sales.management.entity.ProductImage;
import com.sales.management.exception.ResourceNotFoundException;
import com.sales.management.repository.CategoryRepository;
import com.sales.management.repository.OrderItemRepository;
import com.sales.management.repository.ProductRepository;
import com.sales.management.repository.ProductReviewRepository;
import com.sales.management.service.ProductService;
import java.util.Comparator;
import java.util.List;
import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductReviewRepository productReviewRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public ProductResponseDTO createProduct(ProductRequestDTO requestDTO) {
        List<String> imageUrls = normalizeImageUrls(requestDTO);
        Product product = Product.builder()
                .name(requestDTO.getName())
                .description(requestDTO.getDescription())
                .specifications(requestDTO.getSpecifications())
                .price(requestDTO.getPrice())
                .stockQuantity(requestDTO.getStockQuantity())
                .imageUrl(imageUrls.isEmpty() ? null : imageUrls.get(0))
                .warrantyPeriod(requestDTO.getWarrantyPeriod())
                .category(findCategoryById(requestDTO.getCategoryId()))
                .build();
        replaceProductImages(product, imageUrls);

        return toResponseDTO(productRepository.save(product));
    }

    @Override
    public List<ProductResponseDTO> getAllProducts(String keyword, Long categoryId, Boolean inStock) {
        return productRepository.findAll()
                .stream()
                .filter(product -> matchesKeyword(product, keyword))
                .filter(product -> matchesCategory(product, categoryId))
                .filter(product -> matchesStock(product, inStock))
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public ProductResponseDTO getProductById(Long id) {
        return toResponseDTO(findProductById(id));
    }

    @Override
    public List<ProductResponseDTO> getTopRatedProducts(int limit) {
        return productRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .sorted(Comparator
                        .comparingDouble(ProductResponseDTO::getAverageRating)
                        .thenComparingLong(ProductResponseDTO::getReviewCount)
                        .reversed())
                .limit(limit)
                .toList();
    }

    @Override
    public List<ProductResponseDTO> getBestSellingProducts(int limit) {
        return productRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .sorted(Comparator.comparingLong(ProductResponseDTO::getPurchaseCount).reversed())
                .limit(limit)
                .toList();
    }

    @Override
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO requestDTO) {
        Product product = findProductById(id);
        List<String> imageUrls = normalizeImageUrls(requestDTO);
        product.setName(requestDTO.getName());
        product.setDescription(requestDTO.getDescription());
        product.setSpecifications(requestDTO.getSpecifications());
        product.setPrice(requestDTO.getPrice());
        product.setStockQuantity(requestDTO.getStockQuantity());
        product.setImageUrl(imageUrls.isEmpty() ? null : imageUrls.get(0));
        product.setWarrantyPeriod(requestDTO.getWarrantyPeriod());
        product.setCategory(findCategoryById(requestDTO.getCategoryId()));
        replaceProductImages(product, imageUrls);

        return toResponseDTO(productRepository.save(product));
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = findProductById(id);
        productRepository.delete(product);
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private Category findCategoryById(Long id) {
        if (id == null) {
            return null;
        }

        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private boolean matchesKeyword(Product product, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }

        String normalizedKeyword = keyword.toLowerCase();
        return product.getName().toLowerCase().contains(normalizedKeyword)
                || (product.getDescription() != null
                && product.getDescription().toLowerCase().contains(normalizedKeyword));
    }

    private boolean matchesCategory(Product product, Long categoryId) {
        if (categoryId == null) {
            return true;
        }

        Category category = product.getCategory();
        return category != null && categoryId.equals(category.getId());
    }

    private boolean matchesStock(Product product, Boolean inStock) {
        if (inStock == null) {
            return true;
        }

        return inStock ? product.getStockQuantity() > 0 : product.getStockQuantity() <= 0;
    }

    private List<String> normalizeImageUrls(ProductRequestDTO requestDTO) {
        List<String> imageUrls = new ArrayList<>();

        if (requestDTO.getImageUrls() != null) {
            requestDTO.getImageUrls()
                    .stream()
                    .filter(imageUrl -> imageUrl != null && !imageUrl.isBlank())
                    .map(String::trim)
                    .forEach(imageUrls::add);
        }

        if (requestDTO.getImageUrl() != null && !requestDTO.getImageUrl().isBlank()) {
            String mainImageUrl = requestDTO.getImageUrl().trim();
            if (!imageUrls.contains(mainImageUrl)) {
                imageUrls.add(0, mainImageUrl);
            }
        }

        return imageUrls.stream().distinct().toList();
    }

    private void replaceProductImages(Product product, List<String> imageUrls) {
        product.getImages().clear();

        for (int index = 0; index < imageUrls.size(); index += 1) {
            product.getImages().add(ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrls.get(index))
                    .sortOrder(index)
                    .build());
        }
    }

    private ProductResponseDTO toResponseDTO(Product product) {
        Category category = product.getCategory();
        List<String> imageUrls = product.getImages()
                .stream()
                .sorted(Comparator.comparingInt(ProductImage::getSortOrder))
                .map(ProductImage::getImageUrl)
                .toList();
        String mainImageUrl = !imageUrls.isEmpty() ? imageUrls.get(0) : product.getImageUrl();

        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .specifications(product.getSpecifications())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(mainImageUrl)
                .imageUrls(imageUrls)
                .warrantyPeriod(product.getWarrantyPeriod())
                .createdAt(product.getCreatedAt())
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getName() : null)
                .averageRating(productReviewRepository.averageRatingByProductId(product.getId()))
                .reviewCount(productReviewRepository.countByProductId(product.getId()))
                .purchaseCount(orderItemRepository.sumQuantityByProductId(product.getId()))
                .build();
    }
}
