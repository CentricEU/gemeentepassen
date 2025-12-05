package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.UserProfileDto;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.entity.UserProfile;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.UserProfileRepository;
import nl.centric.innovation.local4local.repository.UserRepository;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.UserProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserProfileServiceImplTests {
    @InjectMocks
    private UserProfileService userProfileService;
    @Mock
    private UserRepository userRepository;

    @Mock
    private PrincipalService principleService;

    @Mock
    private UserProfileRepository userProfileRepository;

    private UUID userId;
    private User user;
    private UserProfile userProfile;
    private UserProfileDto userProfileDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        user.setFirstName("John");
        user.setLastName("Doe");

        userProfile = new UserProfile();
        userProfile.setUser(user);
        userProfile.setId(userId);

        userProfileDto = UserProfileDto.builder()
                .address("Address")
                .firstName("First Name")
                .lastName("Last name")
                .telephone("Telephone").build();
    }

    @Test
    @SneakyThrows
    void GivenValidId_WhenUserProfileExists_ThenExpectUserProfileDto() {
        // Given
        UserProfile expectedUser = UserProfile.builder()
                .user(user)
                .id(userId)
                .build();

        User user = new User();

        // When
        when(principleService.getUser()).thenReturn(user);
        when(userProfileRepository.findById(any())).thenReturn(Optional.of(expectedUser));

        // Verify
        UserProfileDto result = userProfileService.findByUserId();

        assertNotNull(result);
    }

    @Test
    @SneakyThrows
    void GivenValidId_WhenUserProfileExistsNotExistButUserExist_ThenExpectUserProfileDto() {
        // Given
        User expectedUser = new User();

        // When
        when(principleService.getUser()).thenReturn(expectedUser);
        when(userProfileRepository.findById(any())).thenReturn(Optional.empty());
        when(userRepository.findById(any())).thenReturn(Optional.of(expectedUser));

        // Verify
        UserProfileDto result = userProfileService.findByUserId();

        assertNotNull(result);
    }

    @Test
    @SneakyThrows
    void GivenUserProfileDto_WhenSave_ThenExpectUserProfileDto() {
        // Given
        userProfile.setId(userId);
        UserProfileDto profileDto = UserProfileDto.builder().build();

        // When
        when(principleService.getUser()).thenReturn(user);
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Verify
        UserProfileDto resultDto = userProfileService.save(profileDto);

        assertNotNull(resultDto, "UserProfileDto should not be null");
    }

    @Test
    void GivenFailureAtSaving_WhenSaveUserProfileDto_ThenExpectRuntimeException() {
        // Given
        UserProfileDto profileDto = UserProfileDto.builder().build();
        // When
        when(principleService.getUser()).thenReturn(user);
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Verify
        assertThrows(DtoValidateNotFoundException.class, () -> userProfileService.save(profileDto), "Expected exception to be thrown when repository operation fails");
    }
}
