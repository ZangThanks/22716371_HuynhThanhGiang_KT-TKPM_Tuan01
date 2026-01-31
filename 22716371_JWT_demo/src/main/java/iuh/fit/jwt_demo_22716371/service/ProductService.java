package iuh.fit.jwt_demo_22716371.service;

import iuh.fit.jwt_demo_22716371.entity.Product;
import iuh.fit.jwt_demo_22716371.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Service
public class ProductService {
    @Autowired
    private ProductRepository repo;

    @GetMapping
    public List<Product> getAll() {
        return repo.findAll();
    }
}
