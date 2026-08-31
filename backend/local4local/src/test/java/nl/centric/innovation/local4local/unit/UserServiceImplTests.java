package nl.centric.innovation.local4local.unit;

import static org.junit.Assert.assertFalse;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.spy;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import jakarta.servlet.http.HttpServletResponse;
import nl.centric.innovation.local4local.dto.CitizenViewDto;
import nl.centric.innovation.local4local.dto.CreateUserDto;
import nl.centric.innovation.local4local.dto.RegisterCitizenUserDto;
import nl.centric.innovation.local4local.dto.SetupPasswordValidateDTO;
import nl.centric.innovation.local4local.dto.UserTableDto;
import nl.centric.innovation.local4local.dto.UserViewDto;
import nl.centric.innovation.local4local.entity.ConfirmationToken;
import nl.centric.innovation.local4local.entity.DiscountCode;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.enums.AccountDeletionReason;
import nl.centric.innovation.local4local.exceptions.CaptchaException;
import nl.centric.innovation.local4local.exceptions.DtoValidateAlreadyExistsException;
import nl.centric.innovation.local4local.exceptions.UnauthorizedActionException;
import nl.centric.innovation.local4local.repository.ConfirmationTokenRepository;
import nl.centric.innovation.local4local.repository.DeletedUserRepository;
import nl.centric.innovation.local4local.service.impl.CitizenBenefitService;
import nl.centric.innovation.local4local.service.impl.DiscountCodeService;
import nl.centric.innovation.local4local.service.impl.LoginAttemptServiceImpl;
import nl.centric.innovation.local4local.service.impl.OfferTransactionService;
import nl.centric.innovation.local4local.service.impl.PassholderService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.service.interfaces.ConfirmationTokenService;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.RecoverPasswordDTO;
import nl.centric.innovation.local4local.dto.RegisterUserDto;
import nl.centric.innovation.local4local.entity.RecoverPassword;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.exceptions.PasswordSameException;
import nl.centric.innovation.local4local.exceptions.RecoverException;
import nl.centric.innovation.local4local.repository.RoleRepository;
import nl.centric.innovation.local4local.repository.UserRepository;
import nl.centric.innovation.local4local.service.impl.CaptchaServiceImpl;
import nl.centric.innovation.local4local.service.impl.RecoverPasswordServiceImpl;


@ExtendWith(MockitoExtension.class)
class UserServiceImplTests {
    @InjectMocks
    private UserService userService;
    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private RecoverPasswordServiceImpl recoverPasswordService;

    @Mock
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private CaptchaServiceImpl captchaService;

    @Mock
    private OfferTransactionService offerTransactionService;

    @Mock
    private LoginAttemptServiceImpl loginAttemptService;

    @Mock
    private ConfirmationTokenRepository confirmationTokenRepository;

    @Mock
    private ConfirmationTokenService confirmationTokenService;

    @Mock
    private PrincipalService principleService;

    @Mock
    private EmailService emailService;

    @Mock
    private DiscountCodeService discountCodeService;

    @Mock
    private HttpServletResponse response;

    @Mock
    private DeletedUserRepository deletedUserRepository;

    @Mock
    private PassholderService passholderService;

    @Mock
    private CitizenBenefitService citizenBenefitService;

    @Value("${local4local.server.name}")
    private String baseURL;

    private static Stream<Arguments> customPasswords() {
        return Stream.of(
                Arguments.of("passwor"),
                Arguments.of("Password"),
                Arguments.of("Pas$word"),
                Arguments.of("Pas1word"),
                Arguments.of("pas1word"),
                Arguments.of("paS$word")
        );
    }

    private static final String SAMPLE_EMAIL = "email@domain.com";
    private static final String SAMPLE_RECAPTCHA = "reCaptcha";
    private static final String VALID_PASS = "Password1!";
    private static final String TOKEN = "validToken!";

    private static Stream<Arguments> customValidEmails() {
        return Stream.of(
                Arguments.of("ana+supplier@gmai.com"),
                Arguments.of("ana@centric.eu")
        );
    }

    private Supplier supplier;
    private Role role;

    @BeforeEach
    void setup() {
        role = Role.builder().id(0).name(Role.ROLE_SUPPLIER).build();
        roleRepository.save(role);

        supplier = Supplier.builder()
                .companyName("Centric")
                .build();
    }

    @ParameterizedTest
    @MethodSource("customPasswords")
    public void GivenDifferentPasswords_WhenSaveForSupplier_ThenExpectDtoValidateException(String password) {
        RegisterUserDto registerUserDto = RegisterUserDto.builder()
                .password(password)
                .retypedPassword(password)
                .build();
        when(roleRepository.findByName(Role.ROLE_SUPPLIER)).thenReturn(Optional.of(role));

        assertThrows(DtoValidateException.class, () -> userService.saveForSupplier(registerUserDto, supplier));
    }

    @Test
    public void GivenDifferentPasswordAndRetypedPassword_WhenSaveForSupplier_ThenExpectDtoValidateException() {
        String password = "Password!$";
        String retypedPassword = "Passwd$";
        RegisterUserDto registerUserDto = RegisterUserDto.builder()
                .password(password)
                .retypedPassword(retypedPassword)
                .build();
        when(roleRepository.findByName(Role.ROLE_SUPPLIER)).thenReturn(Optional.of(role));

        assertThrows(DtoValidateException.class, () -> userService.saveForSupplier(registerUserDto, supplier));
    }

    @Test
    public void GivenNotExistingUserId_WhenFindByUserId_ThenExpectDtoValidateNotFoundException() {
        //Given
        User user = new User();

        //When Then
        assertThrows(DtoValidateNotFoundException.class, () -> userService.findByUserId(user.getId()));
    }

    @ParameterizedTest
    @MethodSource("customValidEmails")
    @SneakyThrows
    public void GivenValidRequest_WhenSaveForSupplier_ThenExpectSavingUser(String email) {
        //Given
        String password = "Password1$";
        RegisterUserDto registerUserDto = RegisterUserDto.builder()
                .password(password)
                .retypedPassword(password)
                .email(email)
                .lastName("lastname")
                .firstName("firstname")
                .build();

        //When
        when(userRepository.save(any(User.class))).thenReturn(mock(User.class));
        when(roleRepository.findByName(Role.ROLE_SUPPLIER)).thenReturn(Optional.of(role));
        when(confirmationTokenRepository.findByUserId(any())).thenReturn(Optional.empty());
        when(confirmationTokenService.save(any())).thenReturn(new ConfirmationToken());

        //Then
        userService.saveForSupplier(registerUserDto, supplier);
        verify(userRepository).save(argThat(user ->
                user.getSupplier() == supplier &&
                        Objects.equals(user.getLastName(), registerUserDto.lastName()) &&
                        Objects.equals(user.getFirstName(), registerUserDto.firstName()) &&
                        Objects.equals(user.getUsername(), registerUserDto.email())
        ));
    }

    @Test
    public void GivenNonExistingEmail_WhenFindByUsername_ShouldThrowException() {
        RecoverPasswordDTO recoverPasswordDTO = RecoverPasswordDTO.builder()
                .email(SAMPLE_EMAIL)
                .reCaptchaResponse(SAMPLE_RECAPTCHA)
                .build();

        when(userRepository.findByUsernameIgnoreCase(SAMPLE_EMAIL)).thenReturn(Optional.empty());
        when(captchaService.isResponseValid(any(), any())).thenReturn(true);

        assertThrows(DtoValidateNotFoundException.class, () -> userService.recoverPassword(recoverPasswordDTO, "127.0.0.1", "nl-NL"));
    }

    @Test
    public void GivenExceedingNumberOfTry_WhenCountAllInLastDay_ShouldThrowError() {
        RecoverPasswordDTO recoverPasswordDTO = RecoverPasswordDTO.builder()
                .email(SAMPLE_EMAIL)
                .reCaptchaResponse(SAMPLE_RECAPTCHA)
                .role(Role.ROLE_SUPPLIER)
                .build();

        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setIsEnabled(true);
        user.setActive(true);
        user.setRole(new Role(1, Role.ROLE_SUPPLIER));

        when(userRepository.findByUsernameIgnoreCase(SAMPLE_EMAIL)).thenReturn(Optional.of(user));
        when(recoverPasswordService.countAllByUserInLastDay(user.getId())).thenReturn(3);
        when(captchaService.isResponseValid(any(), any())).thenReturn(true);

        assertThrows(RecoverException.class, () -> userService.recoverPassword(recoverPasswordDTO, "127.0.0.1", "en"));
    }

    @Test
    public void GivenDifferentRole_WhenCountAllInLastDay_ShouldThrowError() {
        RecoverPasswordDTO recoverPasswordDTO = RecoverPasswordDTO.builder()
                .email(SAMPLE_EMAIL)
                .reCaptchaResponse(SAMPLE_RECAPTCHA)
                .role(Role.ROLE_SUPPLIER)
                .build();

        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setIsEnabled(true);
        user.setId(userId);
        user.setRole(new Role(1, Role.ROLE_MUNICIPALITY_ADMIN));

        when(userRepository.findByUsernameIgnoreCase(SAMPLE_EMAIL)).thenReturn(Optional.of(user));
        when(captchaService.isResponseValid(any(), any())).thenReturn(true);

        assertThrows(DtoValidateException.class, () -> userService.recoverPassword(recoverPasswordDTO, "127.0.0.1", "en"));
    }

    @Test
    public void GivenValidRecoverPasswordDTO_WhenBuild_ThenShouldNotBeNull() {
        RecoverPasswordDTO recoverPasswordDTO = RecoverPasswordDTO.builder()
                .email(SAMPLE_EMAIL)
                .reCaptchaResponse(SAMPLE_RECAPTCHA)
                .build();

        assertNotNull(recoverPasswordDTO);
        assertEquals(SAMPLE_EMAIL, recoverPasswordDTO.email());
        assertEquals(SAMPLE_RECAPTCHA, recoverPasswordDTO.reCaptchaResponse());
    }

    @Test
    public void GivenTwoRecords_WhenBuilding_ThenShouldHaveSameValue() {
        RecoverPasswordDTO recoverPasswordDTO = RecoverPasswordDTO.builder()
                .email(SAMPLE_EMAIL)
                .reCaptchaResponse(SAMPLE_RECAPTCHA)
                .build();

        RecoverPasswordDTO newRecoverPasswordDTO = RecoverPasswordDTO.builder()
                .email(SAMPLE_EMAIL)
                .reCaptchaResponse(SAMPLE_RECAPTCHA)
                .build();

        assertEquals(recoverPasswordDTO, newRecoverPasswordDTO);
    }

    @Test
    @SneakyThrows
    public void GivenValidDto_WhenChangePassword_ThenThePasswordShouldBeChanged() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setPassword("OldPassword1!");

        RecoverPassword recoverPassword = RecoverPassword.builder()
                .userId(userId)
                .build();

        when(recoverPasswordService.findRecoverPasswordByToken(TOKEN)).thenReturn(Optional.of(recoverPassword));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        userService.changePassword(TOKEN, VALID_PASS);

        verify(recoverPasswordService).findRecoverPasswordByToken(TOKEN);
        verify(userRepository).findById(user.getId());
        verify(userRepository).save(user);
    }

    @Test
    @SneakyThrows
    public void GivenInvalidPassword_WhenChangePass_ThenErrorShouldBeThrown() {
        String rawPassword = "invalid!";

        assertThrows(DtoValidateException.class, () -> userService.changePassword(TOKEN, rawPassword));
    }

    @Test
    public void GivenInvalidToken_WhenNotFinding_ThenShouldThrownError() throws RecoverException, DtoValidateException, PasswordSameException {

        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);

        when(recoverPasswordService.findRecoverPasswordByToken(TOKEN)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> userService.changePassword(TOKEN, VALID_PASS));
    }

    @Test
    @SneakyThrows
    public void GivenSamePassword_WhenChangePassword_ThenErrorShouldBeThrown() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setPassword(VALID_PASS);

        RecoverPassword recoverPassword = RecoverPassword.builder()
                .userId(userId)
                .build();

        when(recoverPasswordService.findRecoverPasswordByToken(TOKEN)).thenReturn(Optional.of(recoverPassword));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(bCryptPasswordEncoder.matches(VALID_PASS, user.getPassword())).thenReturn(true);

        assertThrows(PasswordSameException.class, () -> userService.changePassword(TOKEN, VALID_PASS));
    }

    @Test
    void GivenValidRoles_WhenFindAllAdminsByTenantId_ThenUserListReturned() {
        UUID tenantId = UUID.randomUUID();

        //Given
        List<Role> roles = List.of(
                Role.builder().name(Role.ROLE_MUNICIPALITY_ADMIN).build(),
                Role.builder().name(Role.ROLE_SUPER_ADMIN).build()
        );
        when(roleRepository.findByNameIn(List.of(Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN))).thenReturn(roles);

        List<User> adminList = Collections.singletonList(new User());

        // When
        when(userRepository.findAllByTenantIdAndRoleIn(tenantId, roles)).thenReturn(adminList);
        List<User> result = userService.findAllAdminsByTenantId(tenantId);

        // Than
        assertEquals(result, adminList);
        verify(roleRepository, times(1)).findByNameIn(List.of(Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN));
        verify(userRepository, times(1)).findAllByTenantIdAndRoleIn(tenantId, roles);
    }

    @Test
    public void GivenValidRequest_WhenFindAllCashiersBySupplierId_ThenExpectListOfUsers() {
        //Given
        UUID supplierId = UUID.randomUUID();
        List<User> mockUserList = List.of(new User(), new User());
        Role mockedRole = Role.builder().name(Role.ROLE_CASHIER).build();
        when(roleRepository.findByName(Role.ROLE_CASHIER)).thenReturn(Optional.of(mockedRole));
        //When
        when(userRepository.findAllBySupplierIdAndRole(supplierId, mockedRole)).thenReturn(mockUserList);
        List<User> tenants = userService.findAllCashiersBySupplierId(supplierId);

        //Than
        assertEquals(2, tenants.size());
    }

    @Test
    public void GivenValidRequest_WhenFindAllSuppliersBySupplierId_ThenExpectListOfUsers() {
        //Given
        UUID supplierId = UUID.randomUUID();
        List<User> mockUserList = List.of(new User(), new User());
        Role mockedRole = Role.builder().name(Role.ROLE_SUPPLIER).build();
        when(roleRepository.findByName(Role.ROLE_SUPPLIER)).thenReturn(Optional.of(mockedRole));
        //When
        when(userRepository.findAllBySupplierIdAndRole(supplierId, mockedRole)).thenReturn(mockUserList);
        List<User> tenants = userService.findAllSuppliersBySupplierId(supplierId);

        //Than
        assertEquals(2, tenants.size());
    }

    @Test
    public void GivenListOfUser_WhenSaveAll_ThenExpectSuccess() {
        // Given
        List<User> users = Arrays.asList(new User(), new User());
        when(userRepository.saveAll(users)).thenReturn(users);

        // When
        List<User> result = userService.saveAll(users);

        // Then
        verify(userRepository, times(1)).saveAll(users);
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    public void GivenUser_WhenSaveUser_ThenExpectSuccess() {
        // Given
        User user = new User();
        Supplier supplier = new Supplier();
        user.setSupplier(supplier);
        when(userRepository.save(user)).thenReturn(user);

        // When
        UserViewDto resultDto = userService.save(user);

        // Then
        verify(userRepository, times(1)).save(user);
        assertNotNull(resultDto);
    }

    @Test
    @SneakyThrows
    public void GivenUserId_WhenFIndById_ThenExpectUser() {
        //Given
        User user = new User();
        user.setRole(Role.builder()
                .name(Role.ROLE_SUPPLIER).build());
        Supplier supplier = new Supplier();
        user.setSupplier(supplier);
        UUID id = UUID.randomUUID();

        // When
        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        //Then
        UserViewDto resultDto = userService.findByUserId(id);
        assertNotNull(resultDto);

    }

    @Test
    public void GivenInvalidCaptchaResponse_WhenRecoverPassword_ThenExpectCaptchaException() {
        // Given
        RecoverPasswordDTO recoverPasswordDTO = RecoverPasswordDTO.builder()
                .email(SAMPLE_EMAIL)
                .reCaptchaResponse("invalid")
                .build();

        // Then
        assertThrows(CaptchaException.class, () -> userService.recoverPassword(recoverPasswordDTO, "127.0.0.1", "en"));
    }


    @Test
    public void GivenInvalidEmail_WhenRecoverPassword_ThenExpectDtoValidateException() {
        // Given
        String emailNotGood = "invalidEmail";
        RecoverPasswordDTO recoverPasswordDTO = RecoverPasswordDTO.builder()
                .email(emailNotGood)
                .reCaptchaResponse(SAMPLE_RECAPTCHA)
                .build();

        // Then
        assertThrows(DtoValidateException.class, () -> userService.recoverPassword(recoverPasswordDTO, "127.0.0.1", "en"));
    }


    @Test
    @SneakyThrows
    public void GivenNotValidUserId_WhenChangePassword_ThenExpectDtoValidateNotFoundException() {
        // Given
        UUID userId = UUID.randomUUID();

        RecoverPassword recoverPassword = RecoverPassword.builder()
                .userId(userId)
                .build();

        // When
        when(recoverPasswordService.findRecoverPasswordByToken(TOKEN)).thenReturn(Optional.of(recoverPassword));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateNotFoundException.class, () -> userService.changePassword(TOKEN, VALID_PASS));
    }

    @Test
    @SneakyThrows
    void GivenCitizenUser_WhenSaveCitizenUser_ThenExpectSuccess() {

        // Given
        Role role = new Role();
        String email = "test@test.ro";
        String passNumber = "12345678";
        RegisterCitizenUserDto registerUserDto = RegisterCitizenUserDto.builder()
                .email(email)
                .lastName("lastname")
                .firstName("firstname")
                .password("Parola1!")
                .retypedPassword("Parola1!")
                .passNumber(passNumber)
                .build();

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("123123213");
        Passholder passholder = Passholder.builder()
                .passNumber(passNumber)
                .user(user)
                .bsn("123123213")
                .tenant(Tenant.builder().build())
                .build();

        // When
        when(userRepository.findByUsernameIgnoreCase(email)).thenReturn(Optional.empty());
        when(passholderService.getPassholderByPassNumber(passNumber)).thenReturn(passholder);
        when(roleRepository.findByName(Role.ROLE_CITIZEN)).thenReturn(java.util.Optional.of(role));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(confirmationTokenService.save(any())).thenReturn(new ConfirmationToken());

        // Then
        CitizenViewDto result = userService.saveCitizen(registerUserDto, "en");

        assertNotNull(result);
    }

    @Test
    public void GivenCitizenUserWithUsernameExisting_WhenSaveCitizen_ThenExpectDtoValidateAlreadyExistsException() {

        // Given
        String email = "test@test.ro";
        RegisterCitizenUserDto registerUserDto = RegisterCitizenUserDto.builder()
                .email(email)
                .lastName("lastname")
                .firstName("firstname")
                .password("Parola1!").
                retypedPassword("Parola1!")
                .build();
        User user = new User();

        // When
        when(userRepository.findByUsernameIgnoreCase(email)).thenReturn(Optional.of(user));

        // Then
        assertThrows(DtoValidateAlreadyExistsException.class, () -> userService.saveCitizen(registerUserDto, "nl-NL"));

    }

    @Test
    @SneakyThrows
    public void GivenUserAlreadyConfirmed_WhenResendConfirmation_ThenExpectDtoValidateException() {
        // Mocking data
        User user = new User();
        user.setUsername("test@example.com");
        user.setIsEnabled(true);

        // Mocking behavior
        when(userRepository.findByUsernameIgnoreCase("test@example.com")).thenReturn(Optional.of(user));

        // Method invocation and verification
        assertThrows(DtoValidateException.class, () -> userService.resendConfirmation("test@example.com", "en"));
        verifyNoInteractions(confirmationTokenRepository);
        verifyNoInteractions(emailService);
    }

    @Test
    @SneakyThrows
    void GivenValidRequest_WhenResendConfirmation_ThenExpectSuccess() {
        // Given
        User user = new User();
        user.setUsername("test@example.com");
        supplier.setCompanyName("Company");
        user.setSupplier(supplier);
        user.setRole(new Role(1, "ROLE_SUPPLIER"));
        user.setIsEnabled(false);

        ConfirmationToken token = new ConfirmationToken();
        token.setId(UUID.randomUUID());
        when(confirmationTokenRepository.findByUserId(user.getId())).thenReturn(Optional.of(token));

        // When
        when(confirmationTokenService.save(any(ConfirmationToken.class))).thenReturn(token);
        when(userService.findByUsername(user.getUsername())).thenReturn(Optional.of(user));

        userService.resendConfirmation(user.getUsername(), "en");

        // Verify
        verify(confirmationTokenRepository).findByUserId(user.getId());
        verify(confirmationTokenRepository).deleteById(token.getId());
        verify(emailService).sendConfirmAccountEmail(anyString(), eq("en"), anyString(), eq(user.getUsername()));
    }

    @Test
    @SneakyThrows
    void GivenValidToken_WhenConfirmRegistration_ThenExpectSuccess() {
        // Given
        User user = new User();
        user.setRole(new Role(1, "ROLE_SUPPLIER"));
        Supplier supplier = new Supplier();
        supplier.setCompanyName("Company");
        user.setSupplier(supplier);
        ConfirmationToken validToken = new ConfirmationToken();
        validToken.setExpirationDate(LocalDateTime.now().plusHours(1));
        validToken.setUser(user);

        // When
        when(confirmationTokenRepository.findByToken(anyString())).thenReturn(Optional.of(validToken));
        when(userRepository.save(any())).thenReturn(user);

        userService.confirmRegistration("valid_token", mock(HttpServletResponse.class));

        // Verify
        verify(confirmationTokenRepository).findByToken("valid_token");
        verify(confirmationTokenRepository, times(1)).deleteById(validToken.getId());
    }

    @Test
    @SneakyThrows
    public void GivenValidTokenAndValidExpirationDate_WhenConfirmRegistration_ThenExpectSuccess() {
        // Given
        User user = new User();
        user.setRole(new Role(1, "ROLE_SUPPLIER"));
        Supplier supplier = new Supplier();
        supplier.setCompanyName("Company");
        user.setSupplier(supplier);
        ConfirmationToken token = new ConfirmationToken();
        token.setExpirationDate(LocalDateTime.now().plusDays(1));
        token.setUser(user);

        // When
        when(userRepository.save(any())).thenReturn(user);

        when(confirmationTokenRepository.findByToken(anyString())).thenReturn(Optional.of(token));

        userService.confirmRegistration("valid_token", response);

        // Verify
        verify(response).sendRedirect(anyString());
    }

    @Test
    @SneakyThrows
    public void GivenInvalidToken_WhenConfirmRegistration_ThenExpectRedirection() {
        // When
        when(confirmationTokenRepository.findByToken(anyString())).thenReturn(Optional.empty());
        userService.confirmRegistration("invalid_token", response);

        // Verify
        verify(response).sendRedirect(anyString());
    }

    @Test
    @SneakyThrows
    public void GivenExpiredToken_WhenConfirmRegistration_ThenExpectRedirection() {
        // Given
        ConfirmationToken token = new ConfirmationToken();
        token.setExpirationDate(LocalDateTime.now().minusDays(1));

        // When
        when(confirmationTokenRepository.findByToken(anyString())).thenReturn(Optional.of(token));

        userService.confirmRegistration("expired_token", response);

        // Verify
        verify(response).sendRedirect(anyString());
    }

    @Test
    @SneakyThrows
    public void GivenValidRequest_WhenDeleteAccount_ThenExpectSuccess() {
        // Given
        User user = new User();
        user.setUsername("testuser");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setActive(true);

        // When Then
        when(principleService.getUser()).thenReturn(user);
        userService.deleteAccount(List.of(AccountDeletionReason.OTHER_REASON));
        assertFalse(user.isActive());

        verify(userRepository, times(1)).save(user);
        verify(deletedUserRepository, times(1)).saveAll(anyList());
    }

    @Test
    public void GivenEmptyReason_WhenDeleteAccount_ThenDtoValidateException() {
        // Given
        User user = new User();
        user.setUsername("testuser");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setActive(true);

        // When Then
        assertThrows(DtoValidateException.class, () -> userService.deleteAccount(List.of()));

    }

    @Test
    public void GivenAdminCreatingAdmin_WhenCreateUser_ThenExpectSuccess() throws DtoValidateException {
        //Given
        CreateUserDto createUserDto = new CreateUserDto("FN", "LN", "email@domain.com", false);
        UUID tenantId = UUID.randomUUID();
        String language = "en";

        Role municipalityRole = Role.builder().id(0).name(Role.ROLE_MUNICIPALITY_ADMIN).build();

        when(principleService.getTenantId()).thenReturn(tenantId);
        when(roleRepository.findByName(Role.ROLE_MUNICIPALITY_ADMIN)).thenReturn(Optional.of(municipalityRole));
        when(userRepository.save(any(User.class))).thenReturn(User.createUserToEntity(createUserDto, tenantId, ""));

        //When
        userService.createUser(createUserDto, language);

        //Then
        verify(userRepository, times(1)).save(any());
        verify(emailService).sendEmailAfterUserCreated(anyString(), eq("en"), eq(createUserDto.email()));
    }

    @Test
    public void GivenAdminCreatingSuperAdmin_WhenCreateUser_ExpectUnauthorizedActionException() {
        // Given
        CreateUserDto createUserDto = new CreateUserDto("FN", "LN", "email@domain.com", true);

        Role municipalityRole = Role.builder().id(0).name(Role.ROLE_MUNICIPALITY_ADMIN).build();
        User currentUser = new User();
        currentUser.setRole(municipalityRole);

        // When
        when(principleService.getUser()).thenReturn(currentUser);

        // Then
        assertThrows(UnauthorizedActionException.class, () -> userService.createUser(createUserDto, "en"));
    }

    @Test
    public void GivenSuperAdminCreatingSuperAdmin_WhenCreateUser_ExpectSuccess() throws DtoValidateException {
        // Given
        CreateUserDto createUserDto = new CreateUserDto("FN", "LN", "email@domain.com", true);
        UUID tenantId = UUID.randomUUID();
        String language = "en";
        Role superAdminRole = Role.builder().id(0).name(Role.ROLE_SUPER_ADMIN).build();
        User currentUser = new User();
        currentUser.setRole(superAdminRole);
        when(principleService.getUser()).thenReturn(currentUser);
        when(principleService.getTenantId()).thenReturn(tenantId);
        when(roleRepository.findByName(Role.ROLE_SUPER_ADMIN)).thenReturn(Optional.of(superAdminRole));
        when(userRepository.save(any(User.class))).thenReturn(User.createUserToEntity(createUserDto, tenantId, ""));

        // When
        userService.createUser(createUserDto, language);

        // Then
        verify(userRepository, times(1)).save(any());
        verify(emailService).sendEmailAfterUserCreated(anyString(), eq("en"), eq(createUserDto.email()));
    }

    @Test
    public void GivenInvalidEmail_WhenCreateUser_ExpectDtoValidateException() {
        // Given
        CreateUserDto createUserDto = new CreateUserDto("FN", "LN", "invalidEmail", false);
        UUID tenantId = UUID.randomUUID();
        String language = "en";

        // When
        when(principleService.getTenantId()).thenReturn(tenantId);
        when(roleRepository.findByName(Role.ROLE_MUNICIPALITY_ADMIN)).thenReturn(Optional.of(role));
        when(userRepository.save(any(User.class))).thenThrow(new DataIntegrityViolationException(""));

        // Verify
        assertThrows(DtoValidateException.class, () -> userService.createUser(createUserDto, language));
    }

    @Test
    public void GivenEmailOfExistingUser_WhenCreateUser_ExpectDtoValidateException() {
        // Given
        CreateUserDto createUserDto = new CreateUserDto("FN", "LN", "email@domain.com", false);
        UUID tenantId = UUID.randomUUID();
        String language = "en";

        // When
        Role municipalityRole = Role.builder().id(0).name(Role.ROLE_MUNICIPALITY_ADMIN).build();
        when(principleService.getTenantId()).thenReturn(tenantId);
        when(roleRepository.findByName(Role.ROLE_MUNICIPALITY_ADMIN)).thenReturn(Optional.of(municipalityRole));
        when(userRepository.save(any(User.class))).thenThrow(new DataIntegrityViolationException(""));

        // Verify
        assertThrows(DtoValidateException.class, () -> userService.createUser(createUserDto, language));
    }


    @Test
    public void GivenValidSupplierId_WhenGetEmailsBySupplierId_ThenExpectEmailArray() {
        // Given
        UUID supplierId = UUID.randomUUID();
        Tenant mockedTenant = Tenant.builder().name("TestTenant").build();
        Supplier mockedSupplier = Supplier.builder().tenant(mockedTenant).build();
        mockedSupplier.setId(UUID.randomUUID());

        List<User> userList = Arrays.asList(User.builder().username("email1@domain.com").build(),
                User.builder().username("email2@domain.com").build());
        Role mockedRole = Role.builder().name(Role.ROLE_SUPPLIER).build();
        when(roleRepository.findByName(Role.ROLE_SUPPLIER)).thenReturn(Optional.of(mockedRole));
        when(userService.findAllSuppliersBySupplierId(supplierId)).thenReturn(userList);

        String[] expectedEmails = {"email1@domain.com", "email2@domain.com"};

        // When
        String[] actualEmails = userService.getEmailsBySupplierId(supplierId);

        // Then
        assertArrayEquals(expectedEmails, actualEmails);
    }

    @Test
    @SneakyThrows
    public void GivenAlreadyUsedPassnumber_WhenSaveCitizen_ThenExpectDtoValidateAlreadyExistsException() {
        // Given
        String passNumber = "12345678";
        RegisterCitizenUserDto registerUserDto = RegisterCitizenUserDto.builder()
                .email("email")
                .lastName("lastname")
                .firstName("firstname")
                .password("Parola1!")
                .retypedPassword("Parola1!")
                .passNumber(passNumber)
                .build();

        Passholder passholder = Passholder.builder()
                .passNumber(passNumber)
                .build();

        // When
        when(passholderService.getPassholderByPassNumber(passNumber)).thenReturn(passholder);

        // Then
        assertThrows(DtoValidateNotFoundException.class, () -> userService.saveCitizen(registerUserDto, "en"));
    }

    @Test
    void GivenValidPageAndSize_WhenGetAllAdminsByTenantIdPaginated_ThenReturnUserTableDtoList() throws DtoValidateNotFoundException {
        // Given
        int page = 0;
        int size = 2;
        UUID tenantId = UUID.randomUUID();
        UUID currentUserId = UUID.randomUUID();

        List<Role> roles = List.of(
                Role.builder().name(Role.ROLE_MUNICIPALITY_ADMIN).build(),
                Role.builder().name(Role.ROLE_SUPER_ADMIN).build()
        );
        User currentUser = User.builder().build();
        currentUser.setCreatedDate(LocalDateTime.now());
        currentUser.setId(currentUserId);
        currentUser.setUsername("test1@mail.com");
        currentUser.setRole(roles.get(1));
        User otherUser = User.builder().build();
        otherUser.setCreatedDate(LocalDateTime.now());
        otherUser.setId(UUID.randomUUID());
        otherUser.setUsername("test2@mail.com");
        otherUser.setRole(roles.getFirst());

        Page<User> userPage = new PageImpl<>(List.of(currentUser, otherUser));

        when(roleRepository.findByNameIn(List.of(Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN))).thenReturn(roles);
        when(principleService.getTenantId()).thenReturn(tenantId);
        when(userRepository.findAllByTenantIdAndRoleIn(eq(tenantId), eq(roles), any(Pageable.class))).thenReturn(userPage);
        when(principleService.getUser()).thenReturn(currentUser);

        List<UserTableDto> result = userService.getAllAdminsByTenantIdPaginated(page, size);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void GivenValidTenantId_WhenCountAllAdminsByTenantId_ThenReturnCountMinusOne() throws DtoValidateNotFoundException {
        // Given
        UUID tenantId = UUID.randomUUID();
        List<Role> roles = List.of(
                Role.builder().name(Role.ROLE_MUNICIPALITY_ADMIN).build(),
                Role.builder().name(Role.ROLE_SUPER_ADMIN).build()
        );

        when(roleRepository.findByNameIn(List.of(Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN))).thenReturn(roles);
        when(principleService.getTenantId()).thenReturn(tenantId);
        when(userRepository.countAllByTenantIdAndRoleIn(tenantId, roles)).thenReturn(5);

        Integer result = userService.countAllAdminsByTenantId();

        assertEquals(4, result);
    }

    @Test
    public void GivenEmailSupplierTenantTokenRole_WhenCreateCashierUser_ThenUserSavedWithProperties() {
        // Given
        String email = "cashier@domain.com";
        UUID tenantId = UUID.randomUUID();
        String token = UUID.randomUUID().toString().replace("-", "");
        Role cashierRole = Role.builder().id(3).name(Role.ROLE_CASHIER).build();
        Supplier supplierLocal = Supplier.builder().companyName("Company").build();

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        User result = userService.createCashierUser(email, supplierLocal, tenantId, token, cashierRole);

        // Then
        assertNotNull(result);
        assertEquals(email, result.getUsername());
        assertEquals(token, result.getPassword());
        assertEquals(tenantId, result.getTenantId());
        assertEquals(supplierLocal, result.getSupplier());
        assertEquals(cashierRole, result.getRole());
    }

    @Test
    public void GivenSupplierEmailsLanguage_WhenCreateCashierUsers_ThenUsersCreatedAndEmailsSent() {
        // Given
        List<String> emailsList = List.of("c1@domain.com", "c2@domain.com");
        Set<String> emails = new LinkedHashSet<>(emailsList);
        String language = "en";
        Supplier supplier = Supplier.builder()
                .companyName("Company")
                .build();

        Role cashierRole = Role.builder()
                .id(3)
                .name(Role.ROLE_CASHIER)
                .build();

        UUID tenantId = UUID.randomUUID();

        when(roleRepository.findByName(Role.ROLE_CASHIER))
                .thenReturn(java.util.Optional.of(cashierRole));

        when(principleService.getTenantId()).thenReturn(tenantId);

        // Return the argument when saving a user
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Spy userService to verify sendCashierEmail calls
        UserService spyUserService = spy(userService);

        // When
        List<User> result = spyUserService.createCashierUsers(supplier, emails, language);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());

        for (int i = 0; i < emailsList.size(); i++) {
            User u = result.get(i);

            assertEquals(emailsList.get(i), u.getUsername());
            assertEquals(supplier, u.getSupplier());
            assertEquals(cashierRole, u.getRole());
            assertEquals(tenantId, u.getTenantId());
            assertNotNull(u.getPassword());
        }
    }

    @Test
    public void GivenValidSupplierId_WhenGetCashierEmailsForSupplier_ThenReturnUsernames() {
        // Given
        UUID supplierId = UUID.randomUUID();
        Role cashierRole = Role.builder().name(Role.ROLE_CASHIER).build();
        List<User> userList = List.of(
                User.builder().username("c1@domain.com").build(),
                User.builder().username("c2@domain.com").build()
        );

        when(roleRepository.findByName(Role.ROLE_CASHIER)).thenReturn(Optional.of(cashierRole));
        when(userRepository.findAllBySupplierIdAndRole(supplierId, cashierRole)).thenReturn(userList);

        // When
        List<String> result = userService.getCashierEmailsForSupplier(supplierId);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("c1@domain.com", result.get(0));
        assertEquals("c2@domain.com", result.get(1));
    }

    @ParameterizedTest
    @MethodSource("provideValidAndInvalidTokens")
    void GivenUsernameAndToken_WhenValidateToken_ThenReturnExpectedResult(String username, String token, Boolean expectedResult) throws DtoValidateException {
        // Given
        User user = User.builder().username(username).password("validToken").build();
        when(userRepository.findByUsernameIgnoreCase(anyString())).thenReturn(Optional.of(user));
        // When
        Boolean result = userService.validateToken(new SetupPasswordValidateDTO(token, username));
        // Then
        assertEquals(expectedResult, result);
    }

    @Test
    void GivenNonExistingUsername_WhenValidateToken_ThenThrowDtoValidateNotFoundException() {
        // Given
        String username = "nonexistent@domain.com";
        String token = "someToken";
        when(userRepository.findByUsernameIgnoreCase(anyString())).thenReturn(Optional.empty());

        // Then
        assertThrows(DtoValidateNotFoundException.class, () -> userService.validateToken(new SetupPasswordValidateDTO(username, token)));
    }

    @Test
    void GivenExistingPassholder_WhenDeletePassholder_ThenPassholderIsDeleted() throws DtoValidateException {
        // Given
        UUID passholderId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();
        Passholder mockPassholder = new Passholder();
        mockPassholder.setId(passholderId);
        mockPassholder.setBsn("123456789");

        User user = new User();
        user.setId(UUID.randomUUID());
        mockPassholder.setUser(user);

        User currentUser = new User();
        currentUser.setTenantId(tenantId);

        when(principleService.getUser()).thenReturn(currentUser);
        when(passholderService.findByIdAndTenantId(passholderId, tenantId)).thenReturn(mockPassholder);
        when(offerTransactionService.getTransactionByUserId(user.getId())).thenReturn(Collections.emptyList());

        // When
        userService.deletePassholder(passholderId);

        // Then
        verify(passholderService, times(1)).deleteById(passholderId);
    }

    @Test
    void GivenNonExistingPassholder_WhenDeletePassholder_ThenExceptionThrown() throws DtoValidateNotFoundException {
        // Given
        UUID passholderId = UUID.randomUUID();

        // Then
        assertThrows(NullPointerException.class, () -> userService.deletePassholder(passholderId));
    }

    @Test
    void GivenUserId_WhenDeleteDiscountCodesForUserId_ThenDiscountCodesAreDeactivatedAndSaved() {
        // Given
        UUID userId = UUID.randomUUID();
        DiscountCode code1 = new DiscountCode();
        code1.setIsActive(true);
        DiscountCode code2 = new DiscountCode();
        code2.setIsActive(true);
        List<DiscountCode> codes = List.of(code1, code2);

        when(discountCodeService.getAllByUserId(userId)).thenReturn(codes);

        // When
        userService.deleteDiscountCodesForUserId(userId);

        // Then
        Assertions.assertFalse(code1.getIsActive());
        Assertions.assertFalse(code2.getIsActive());
        verify(discountCodeService, times(1)).saveAll(codes);
    }

    @Test
    void GivenExistingPassholder_WhenDeletePassholder_ThenPassholderIsDeletedAndRelatedEntitiesUpdated() throws DtoValidateException {
        // Given
        UUID passholderId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();

        Passholder passholder = new Passholder();
        passholder.setId(passholderId);
        passholder.setBsn("123456789");

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setTenantId(tenantId);
        user.setUsername("123456789");
        passholder.setUser(user);

        User currentUser = new User();
        currentUser.setTenantId(tenantId);

        when(principleService.getUser()).thenReturn(currentUser);
        when(passholderService.findByIdAndTenantId(passholderId, tenantId)).thenReturn(passholder);
        when(offerTransactionService.getTransactionByUserId(user.getId())).thenReturn(Collections.emptyList());
        when(discountCodeService.getAllByUserId(user.getId())).thenReturn(Collections.emptyList());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        userService.deletePassholder(passholderId);

        // Then
        verify(passholderService, times(1)).deleteById(passholderId);
        verify(citizenBenefitService, times(1)).deleteCitizenBenefitsByUserIdd(user.getId());
        verify(discountCodeService, times(1)).saveAll(anyList());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void GivenNonDigitalPassholder_WhenUpdateUsernameWhenDeletingPassholder_ThenUsernameIsUpdatedAndSaved() {
        // Given
        Passholder passholder = new Passholder();
        User user = new User();
        user.setUsername("bsn123");
        passholder.setUser(user);
        passholder.setBsn("bsn123");

        // When
        userService.updateUsernameWhenDeletingPassholder(passholder);

        // Then
        verify(userRepository).save(user);
        Assertions.assertTrue(user.getUsername().startsWith("deleted_"));
    }

    @Test
    void GivenDigitalPassholder_WhenUpdateUsernameWhenDeletingPassholder_ThenUsernameIsNotUpdated() {
        // Given
        Passholder passholder = new Passholder();
        User user = new User();
        user.setUsername("otherUsername");
        passholder.setUser(user);
        passholder.setBsn("bsn123");

        // When
        userService.updateUsernameWhenDeletingPassholder(passholder);

        // Then
        verify(userRepository, never()).save(any(User.class));
    }


    @SneakyThrows
    public void GivenValidCitizenDtos_WhenSaveCitizens_ThenAllUsersSaved() {
        List<RegisterCitizenUserDto> dtos = List.of(
                RegisterCitizenUserDto.builder().email("user1@domain.com").passNumber("123").build(),
                RegisterCitizenUserDto.builder().email("user2@domain.com").passNumber("456").build()
        );

        Tenant tenant1 = new Tenant();
        tenant1.setId(UUID.randomUUID());

        Passholder passholder1 = Passholder.builder()
                .tenant(tenant1).build();

        Tenant tenant2 = new Tenant();
        tenant2.setId(UUID.randomUUID());

        Passholder passholder2 = Passholder.builder()
                .tenant(tenant2).build();

        Role role = Role.builder().name(Role.ROLE_CITIZEN).build();

        when(roleRepository.findByName(Role.ROLE_CITIZEN)).thenReturn(Optional.of(role));
        when(passholderService.getPassholderByPassNumber("123")).thenReturn(passholder1);
        when(passholderService.getPassholderByPassNumber("456")).thenReturn(passholder2);

        userService.saveCitizens(dtos, "en");

        verify(userRepository, times(1)).saveAll(argThat(users ->
                (int) StreamSupport.stream(users.spliterator(), false).count() == 2));
    }

    @SneakyThrows
    public void GivenDuplicatePassNumber_WhenSaveCitizens_ThenThrowDtoValidateAlreadyExistsException() {
        List<RegisterCitizenUserDto> dtos = List.of(
                RegisterCitizenUserDto.builder().email("user1@domain.com").passNumber("123").build()
        );

        Passholder passholder = Passholder.builder().user(new User()).build();

        when(passholderService.getPassholderByPassNumber("123")).thenReturn(passholder);

        assertThrows(DtoValidateAlreadyExistsException.class, () -> userService.saveCitizens(dtos, "en"));
    }

    @SneakyThrows
    public void GivenInvalidEmail_WhenSaveCitizens_ThenThrowDtoValidateException() {
        List<RegisterCitizenUserDto> dtos = List.of(
                RegisterCitizenUserDto.builder().email("invalidEmail").passNumber("123").build()
        );

        assertThrows(DtoValidateException.class, () -> userService.saveCitizens(dtos, "en"));
    }

    @SneakyThrows
    public void GivenEmptyDtoList_WhenSaveCitizens_ThenNoUsersSaved() {
        List<RegisterCitizenUserDto> dtos = Collections.emptyList();

        userService.saveCitizens(dtos, "en");

        verify(userRepository, never()).saveAll(anyList());
    }


    private static Stream<Arguments> provideValidAndInvalidTokens() {
        return Stream.of(
                Arguments.of("user1@domain.com", "validToken", true),
                Arguments.of("user2@domain.com", "invalidToken", false)
        );
    }

    @Test
    void GivenNullEmails_WhenDeleteCashierUsers_ThenNoInteractionWithRepository() {
        // Given
        Supplier supplier = Supplier.builder().build();
        supplier.setId(UUID.randomUUID());

        // When
        userService.deleteCashierUsers(supplier, null);

        // Then
        verify(userRepository, never()).saveAll(any());
    }

    @Test
    void GivenEmptyEmails_WhenDeleteCashierUsers_ThenNoInteractionWithRepository() {
        // Given
        Supplier supplier = Supplier.builder().build();
        supplier.setId(UUID.randomUUID());

        // When
        userService.deleteCashierUsers(supplier, Set.of());

        // Then
        verify(userRepository, never()).saveAll(any());
    }

    @Test
    void GivenMatchingCashierEmails_WhenDeleteCashierUsers_ThenCashiersAreDeactivatedAndSaved() {
        // Given
        UUID supplierId = UUID.randomUUID();
        Supplier supplier = Supplier.builder().build();
        supplier.setId(supplierId);

        Role cashierRole = Role.builder().name(Role.ROLE_CASHIER).build();

        User cashier1 = User.builder().username("cashier1@domain.com").build();
        cashier1.setActive(true);
        User cashier2 = User.builder().username("cashier2@domain.com").build();
        cashier2.setActive(true);
        User cashier3 = User.builder().username("cashier3@domain.com").build();
        cashier3.setActive(true);

        when(roleRepository.findByName(Role.ROLE_CASHIER)).thenReturn(Optional.of(cashierRole));
        when(userRepository.findAllBySupplierIdAndRole(supplierId, cashierRole))
                .thenReturn(List.of(cashier1, cashier2, cashier3));

        Set<String> emailsToDelete = Set.of("cashier1@domain.com", "cashier2@domain.com");

        // When
        userService.deleteCashierUsers(supplier, emailsToDelete);

        // Then
        verify(userRepository, times(1)).saveAll(argThat(saved -> {
            List<User> savedList = new ArrayList<>();
            saved.forEach(savedList::add);
            return savedList.size() == 2 &&
                    savedList.stream().allMatch(u -> !u.isActive()) &&
                    savedList.stream().allMatch(u -> u.getUsername().startsWith("deleted_"));
        }));
    }
}
