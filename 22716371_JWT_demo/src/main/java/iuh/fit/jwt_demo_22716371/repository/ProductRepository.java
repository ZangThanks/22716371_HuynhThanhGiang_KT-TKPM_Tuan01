package iuh.fit.jwt_demo_22716371.repository;

import iuh.fit.jwt_demo_22716371.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
