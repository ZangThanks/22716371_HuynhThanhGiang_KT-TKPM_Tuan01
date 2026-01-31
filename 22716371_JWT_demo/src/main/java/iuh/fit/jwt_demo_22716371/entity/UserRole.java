package iuh.fit.jwt_demo_22716371.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public enum UserRole {
    ADMIN("ADMIN"),
    USER("USER");

    private String roleName;
}
