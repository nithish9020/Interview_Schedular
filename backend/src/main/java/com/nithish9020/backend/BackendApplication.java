package com.nithish9020.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		System.out.println("password : system : "+new BCryptPasswordEncoder().encode("1234"));
		SpringApplication.run(BackendApplication.class, args);
	}

}
