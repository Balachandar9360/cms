package com.canteen.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @Builder
public class StudentResponse {
    private Long id;
    private String studentId;
    private String registrationNumber;
    private String name;
    private String email;
    private String mobile;
    private LocalDate dateOfBirth;
    private String gender;
    private String department;
    private String course;
    private String year;
    private String semester;
    private String address;
    private LocalDate joiningDate;
    private String status;
}
