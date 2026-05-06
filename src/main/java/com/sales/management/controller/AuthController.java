package com.sales.management.controller;

import com.sales.management.dto.request.LoginRequestDTO;
import com.sales.management.dto.request.RegisterRequestDTO;
import com.sales.management.dto.request.UserProfileUpdateRequestDTO;
import com.sales.management.dto.response.AuthResponseDTO;
import com.sales.management.dto.response.UserProfileResponseDTO;
import com.sales.management.entity.User;
import com.sales.management.entity.UserRole;
import com.sales.management.exception.ResourceNotFoundException;
import com.sales.management.exception.BadRequestException;
import com.sales.management.repository.UserRepository;
import com.sales.management.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponseDTO register(@Valid @RequestBody RegisterRequestDTO requestDTO) {
        if (userRepository.existsByUsername(requestDTO.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        User user = User.builder()
                .username(requestDTO.getUsername())
                .password(passwordEncoder.encode(requestDTO.getPassword()))
                .role(UserRole.ROLE_USER)
                .build();

        User savedUser = userRepository.save(user);
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(savedUser.getUsername())
                .password(savedUser.getPassword())
                .authorities(savedUser.getRole().name())
                .build();

        return buildAuthResponse(savedUser, jwtService.generateToken(userDetails));
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@Valid @RequestBody LoginRequestDTO requestDTO) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        requestDTO.getUsername(),
                        requestDTO.getPassword()
                )
        );

        User user = userRepository.findByUsername(requestDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRole().name())
                .build();

        return buildAuthResponse(user, jwtService.generateToken(userDetails));
    }

    @GetMapping("/me")
    public UserProfileResponseDTO getCurrentUser(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + principal.getName()));

        return UserProfileResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .build();
    }

    @PutMapping("/me")
    public UserProfileResponseDTO updateCurrentUser(
            Principal principal,
            @Valid @RequestBody UserProfileUpdateRequestDTO requestDTO
    ) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + principal.getName()));

        user.setFullName(requestDTO.getFullName());
        user.setPhone(requestDTO.getPhone());
        user.setAddress(requestDTO.getAddress());

        User savedUser = userRepository.save(user);

        return UserProfileResponseDTO.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .fullName(savedUser.getFullName())
                .phone(savedUser.getPhone())
                .address(savedUser.getAddress())
                .role(savedUser.getRole())
                .build();
    }

    private AuthResponseDTO buildAuthResponse(User user, String token) {
        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }
}
