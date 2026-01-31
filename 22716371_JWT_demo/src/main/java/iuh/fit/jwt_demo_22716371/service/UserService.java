package iuh.fit.jwt_demo_22716371.service;

import iuh.fit.jwt_demo_22716371.entity.User;
import iuh.fit.jwt_demo_22716371.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository repo;

    public List<User> getAll() {
        return repo.findAll();
    }
}
