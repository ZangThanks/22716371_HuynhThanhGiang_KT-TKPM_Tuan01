package iuh.fit.jwt_demo_22716371.repository;

import iuh.fit.jwt_demo_22716371.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
