package iuh.fit.jwt_demo_22716371.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.*;
import java.util.Base64;

//@Component
public class RsaKeyInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        File privateKeyFile = new File("src/main/resources/certs/private.pem");
        File publicKeyFile = new File("src/main/resources/certs/public.pem");

        if (privateKeyFile.exists() && publicKeyFile.exists()) {
            System.out.println("RSA Keys already exist. Skipping generation.");
            return;
        }

        System.out.println("Generating RSA Keys...");

        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();

        PublicKey publicKey = keyPair.getPublic();
        PrivateKey privateKey = keyPair.getPrivate();

        File certsDir = new File("src/main/resources/certs");
        if (!certsDir.exists()) {
            certsDir.mkdirs();
        }

        try (FileOutputStream fos = new FileOutputStream(privateKeyFile)) {
            fos.write("-----BEGIN PRIVATE KEY-----\n".getBytes());
            fos.write(Base64.getMimeEncoder(64, "\n".getBytes()).encode(privateKey.getEncoded()));
            fos.write("\n-----END PRIVATE KEY-----\n".getBytes());
        }

        try (FileOutputStream fos = new FileOutputStream(publicKeyFile)) {
            fos.write("-----BEGIN PUBLIC KEY-----\n".getBytes());
            fos.write(Base64.getMimeEncoder(64, "\n".getBytes()).encode(publicKey.getEncoded()));
            fos.write("\n-----END PUBLIC KEY-----\n".getBytes());
        }

        System.out.println("RSA Keys generated successfully!");
        System.out.println("Location: src/main/resources/certs/");
        System.out.println("   - private.pem (Private Key - KEEP SECRET!)");
        System.out.println("   - public.pem (Public Key)");
    }
}
