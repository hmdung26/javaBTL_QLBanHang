package com.sales.management.config;

import com.sales.management.entity.Banner;
import com.sales.management.entity.Category;
import com.sales.management.entity.User;
import com.sales.management.entity.UserRole;
import com.sales.management.entity.Invoice;
import com.sales.management.entity.Payment;
import com.sales.management.entity.PaymentMethod;
import com.sales.management.entity.PaymentStatus;
import com.sales.management.entity.Product;
import com.sales.management.entity.WarehouseItem;
import com.sales.management.entity.WarehouseStatus;
import com.sales.management.repository.BannerRepository;
import com.sales.management.repository.CategoryRepository;
import com.sales.management.repository.UserRepository;
import com.sales.management.repository.InvoiceRepository;
import com.sales.management.repository.OrderRepository;
import com.sales.management.repository.PaymentRepository;
import com.sales.management.repository.ProductRepository;
import com.sales.management.repository.WarehouseItemRepository;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BannerRepository bannerRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProductRepository productRepository;
    private final WarehouseItemRepository warehouseItemRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    @Value("${app.default-admin.username}")
    private String adminUsername;

    @Value("${app.default-admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        seedDefaultAdmin();
        seedDefaultCategories();
        seedDefaultBanners();
        backfillWarehouseItems();
        backfillOrderDocuments();
    }

    private void backfillWarehouseItems() {
        for (Product product : productRepository.findAll()) {
            long availableCount = warehouseItemRepository
                    .countByProductIdAndStatus(product.getId(), WarehouseStatus.AVAILABLE);
            for (int index = (int) availableCount; index < product.getStockQuantity(); index += 1) {
                String identifier = "LEGACY-" + product.getId() + "-"
                        + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                warehouseItemRepository.save(WarehouseItem.builder()
                        .product(product)
                        .barcode(identifier)
                        .serialNumber(identifier)
                        .shelfLocation("Chờ phân khu")
                        .status(WarehouseStatus.AVAILABLE)
                        .build());
            }
        }
    }

    private void backfillOrderDocuments() {
        orderRepository.findAll().forEach(order -> {
            if (paymentRepository.findByOrderId(order.getId()).isEmpty()) {
                paymentRepository.save(Payment.builder()
                        .order(order)
                        .method(PaymentMethod.COD)
                        .status(PaymentStatus.PENDING)
                        .amount(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO)
                        .build());
            }
            if (invoiceRepository.findByOrderId(order.getId()).isEmpty()) {
                invoiceRepository.save(Invoice.builder().order(order).build());
            }
        });
    }

    private void seedDefaultAdmin() {
        if (userRepository.existsByUsername(adminUsername)) {
            return;
        }

        User admin = User.builder()
                .username(adminUsername)
                .password(passwordEncoder.encode(adminPassword))
                .role(UserRole.ROLE_ADMIN)
                .build();

        userRepository.save(admin);
    }

    private void seedDefaultCategories() {
        if (categoryRepository.count() > 0) {
            return;
        }

        categoryRepository.save(Category.builder().name("PC Gaming").description("Máy tính chơi game").build());
        categoryRepository.save(Category.builder().name("PC Workstation").description("Máy tính làm đồ họa và render").build());
        categoryRepository.save(Category.builder().name("Linh kiện máy tính").description("CPU, RAM, SSD, VGA, mainboard").build());
        categoryRepository.save(Category.builder().name("Màn hình").description("Màn hình gaming và văn phòng").build());
        categoryRepository.save(Category.builder().name("Gaming Gear").description("Bàn phím, chuột, tai nghe").build());
    }

    private void seedDefaultBanners() {
        if (bannerRepository.count() > 0) {
            return;
        }

        bannerRepository.save(Banner.builder()
                .title("Siêu sale PC gaming")
                .subtitle("Nâng cấp cấu hình, tối ưu hiệu năng cho game thủ")
                .imageUrl("https://placehold.co/900x500/d71920/ffffff?text=PC+Gaming+Sale")
                .linkUrl("/products")
                .active(true)
                .sortOrder(1)
                .build());
        bannerRepository.save(Banner.builder()
                .title("Linh kiện chính hãng")
                .subtitle("CPU, VGA, RAM, SSD sẵn hàng")
                .imageUrl("https://placehold.co/900x500/111827/ffffff?text=Linh+Kien+PC")
                .linkUrl("/products")
                .active(true)
                .sortOrder(2)
                .build());
    }
}
