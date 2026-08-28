package com.canteen.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class StudentRegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Mobile is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile must be 10 digits")
    private String mobile;

    private LocalDate dateOfBirth;
    private String gender;
    private String department;
    private String course;
    private String year;
    private String semester;
    private String address;
    private LocalDate joiningDate;
}
