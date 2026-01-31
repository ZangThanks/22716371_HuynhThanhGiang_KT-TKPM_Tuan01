package iuh.fit.jwt_demo_22716371.controller;


import iuh.fit.jwt_demo_22716371.entity.Product;
import iuh.fit.jwt_demo_22716371.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user/products")
public class ProductController {

    @Autowired
    private ProductService service;

    @GetMapping
    public List<Product> getAllBooks() {
        return service.getAll();
    }
}
