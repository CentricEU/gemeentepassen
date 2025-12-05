package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.centric.innovation.local4local.dto.UserProfileDto;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.entity.UserProfile;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.UserProfileRepository;
import nl.centric.innovation.local4local.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@PropertySource({"classpath:errorcodes.properties"})
public class UserProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    private final PrincipalService principalService;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Transactional
    public UserProfileDto save(UserProfileDto userProfileDto) throws DtoValidateNotFoundException {
        Optional<User> user = userRepository.findById(getUserId());
        if (user.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }
        User updatedUser = user.get();
        updatedUser.setLastName(userProfileDto.lastName());
        updatedUser.setFirstName(userProfileDto.firstName());

        UserProfile userProfile = UserProfile.userProfileDtoToEntity(userProfileDto);
        userProfile.setUser(user.get());
        userProfile.setId(updatedUser.getId());
        updatedUser.setUserProfile((userProfile));

        User savedUser = userRepository.save(updatedUser);
        return UserProfileDto.entityToUserProfileDto(savedUser.getUserProfile());
    }

    public UserProfileDto findByUserId() throws DtoValidateNotFoundException {
        UUID userId = getUserId();

        Optional<UserProfile> userProfile = userProfileRepository.findById(userId);
        if (userProfile.isPresent()) {
            return UserProfileDto.entityToUserProfileDto(userProfile.get());
        }

        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }
        return UserProfileDto.userEntityToUserProfileDto(user.get());
    }

    private UUID getUserId() {
        return principalService.getUser().getId();
    }
}
