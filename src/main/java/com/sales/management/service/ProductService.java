package com.sales.management.service;

import com.sales.management.dto.request.ProductRequestDTO;
import com.sales.management.dto.response.ProductResponseDTO;
import java.util.List;

public interface ProductService {

    ProductResponseDTO createProduct(ProductRequestDTO requestDTO);

    List<ProductResponseDTO> getAllProducts(String keyword, Long categoryId, Boolean inStock);

    List<ProductResponseDTO> getTopRatedProducts(int limit);

    List<ProductResponseDTO> getBestSellingProducts(int limit);

    ProductResponseDTO getProductById(Long id);

    ProductResponseDTO updateProduct(Long id, ProductRequestDTO requestDTO);

    void deleteProduct(Long id);
}
