package nl.centric.innovation.local4local.service.impl;

import static nl.centric.innovation.local4local.util.CommonUtils.getBaseUrl;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.CitizenViewDto;
import nl.centric.innovation.local4local.dto.CreateUserDto;
import nl.centric.innovation.local4local.dto.RegisterCitizenUserDto;

import nl.centric.innovation.local4local.entity.DeletedUser;
import nl.centric.innovation.local4local.entity.LoginAttempt;
import nl.centric.innovation.local4local.entity.Passholder;
import nl.centric.innovation.local4local.entity.RecoverPassword;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.entity.ConfirmationToken;
import nl.centric.innovation.local4local.enums.AccountDeletionReason;
import nl.centric.innovation.local4local.exceptions.DtoValidateAlreadyExistsException;

import nl.centric.innovation.local4local.repository.ConfirmationTokenRepository;
import nl.centric.innovation.local4local.repository.DeletedUserRepository;
import nl.centric.innovation.local4local.service.interfaces.CaptchaService;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.LoginAttemptService;
import nl.centric.innovation.local4local.service.interfaces.RecoverPasswordService;
import nl.centric.innovation.local4local.service.interfaces.ConfirmationTokenService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import nl.centric.innovation.local4local.dto.RecoverPasswordDTO;
import nl.centric.innovation.local4local.dto.RegisterUserDto;
import nl.centric.innovation.local4local.dto.UserViewDto;
import nl.centric.innovation.local4local.exceptions.CaptchaException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.exceptions.PasswordSameException;
import nl.centric.innovation.local4local.exceptions.RecoverException;
import nl.centric.innovation.local4local.repository.RoleRepository;
import nl.centric.innovation.local4local.repository.UserRepository;
import nl.centric.innovation.local4local.util.ModelConverter;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@PropertySource({"classpath:errorcodes.properties"})
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final LoginAttemptService loginAttemptService;

    private final RecoverPasswordService recoverPasswordService;

    private final CaptchaService captchaService;

    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    private final RoleRepository roleRepository;

    private final ConfirmationTokenService confirmationTokenService;

    private final EmailService emailService;

    private final PassholderService passholderService;

    private final PrincipalService principalService;

    private final ConfirmationTokenRepository confirmationTokenRepository;

    private final DeletedUserRepository deletedUserRepository;

    @Value("${error.account.tokenExpired}")
    private String confirmationTokenExpired;

    @Value("${error.passwords.requirements}")
    private String errorPasswordRequirements;

    @Value("${error.mail.requirements}")
    private String errorMailRequirements;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Value("${error.password.mismatch}")
    private String errorPasswordMismatch;
    @Value("${local4local.backend.name}")
    private String backendBaseUrl;

    @Value("${error.recovery.exceeded}")
    private String errorRecoveryExceeded;

    @Value("${error.captcha.show}")
    private String errorCaptchaShow;

    @Value("${error.recovery.samePassword}")
    private String errorSamePassword;

    @Value("${error.unique.violation}")
    private String errorUniqueViolation;

    @Value("${error.account.alreadyConfirmed}")
    private String errorAlreadyConfirmed;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    @Value("${error.mail.alreadyUsed}")
    private String errorEmailAlreadyUsed;

    @Value("${error.citizen.alreadyUsedPassnumber}")
    private String errorCitizenAlreadyUsedPassnumber;

    @Value("${local4local.server.name}")
    private String baseUrl;

    @Value("${local4local.municipality.server.name}")
    private String baseMunicipalityUrl;

    @Value("${error.role.notAllowed}")
    private String errorRoleNotAllowed;

    private static final int ATTEMPTS_LIMIT = 3;

    private static final String RESET_URL = "/recover/reset-password/";

    public String saveForSupplier(RegisterUserDto registerUserDto, Supplier supplier) throws DtoValidateException {
        Role role = roleRepository.findByName(Role.ROLE_SUPPLIER).get();
        User user = validateAndReturnSupplier(registerUserDto);
        user.setSupplier(supplier);
        user.setRole(role);
        user.setIsEnabled(false);
        User savedUser = userRepository.save(user);

        return manageConfirmationToken(savedUser);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsernameIgnoreCase(username);
    }

    public List<User> findAllAdminsByTenantId(UUID tenandId) {
        Role role = roleRepository.findByName(Role.ROLE_MUNICIPALITY_ADMIN).get();
        return userRepository.findAllByTenantIdAndRole(tenandId, role);
    }

    public List<User> saveAll(List<User> userList) {
        return (List<User>) userRepository.saveAll(userList);
    }

    public UserViewDto save(User user) {
        return ModelConverter.entityToUserViewDto(userRepository.save(user));
    }

    @Transactional
    public CitizenViewDto saveCitizen(RegisterCitizenUserDto registerCitizenUserDto, String language) throws DtoValidateException {
        validateCitizenEmail(registerCitizenUserDto);

        Passholder passholder = passholderService.getPassholderByPassNumber(registerCitizenUserDto.passNumber());

        if (Optional.ofNullable(passholder.getUser()).isPresent()) {
            throw new DtoValidateAlreadyExistsException(errorCitizenAlreadyUsedPassnumber);
        }

        Role role = roleRepository.findByName(Role.ROLE_CITIZEN).orElseThrow(() -> new IllegalArgumentException("Role not found"));

        User savedUser = createAndSaveCitizen(registerCitizenUserDto, passholder, role);
        passholderService.saveUserForPassholder(passholder, savedUser);

        sendConfirmation(savedUser, language);

        return ModelConverter.entityToCitizenViewDto(savedUser);
    }

    public List<User> findAllBySupplierId(UUID supplierId) {
        return userRepository.findAllBySupplierId(supplierId);
    }

    public String[] getEmailsBySupplierId(UUID supplierId) {
        List<User> supplierUsers = findAllBySupplierId(supplierId);
        return supplierUsers.stream().map(User::getUsername).toArray(String[]::new);
    }

    public UserViewDto findByUserId(UUID userId) throws DtoValidateNotFoundException {
        Optional<User> user = userRepository.findById(userId);

        if (user.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return ModelConverter.entityToUserViewDto(user.get());
    }

    public void recoverPassword(RecoverPasswordDTO recoverPasswordDTO, String remoteAddress, String language)
            throws RecoverException, DtoValidateException, CaptchaException {
        validateEmail(recoverPasswordDTO.email());
        validateCaptcha(recoverPasswordDTO.reCaptchaResponse(), remoteAddress);

        User user = getUserByEmail(recoverPasswordDTO.email());

        if(!user.getRole().getName().equals(recoverPasswordDTO.role())) {
            throw new DtoValidateException(errorRoleNotAllowed);
        }

        enforceRateLimiting(user.getId(), remoteAddress);

        RecoverPassword recoverPassword = RecoverPassword.of(user.getId());
        recoverPasswordService.save(recoverPassword);

        sendRecoveryEmail(user, language, recoverPassword);
    }

    public void changePassword(String token, String rawPassword)
            throws RecoverException, DtoValidateException, PasswordSameException {

        if (!isPasswordValid(rawPassword)) {
            throw new DtoValidateException(errorPasswordRequirements);
        }

        Optional<RecoverPassword> rp = recoverPasswordService.findRecoverPasswordByToken(token);
        Optional<User> user = userRepository.findById(rp.get().getUserId());

        if (!rp.isPresent() || !user.isPresent()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        if (bCryptPasswordEncoder.matches(rawPassword, user.get().getPassword())) {
            throw new PasswordSameException(errorSamePassword);
        }

        User updatedUser = user.get();
        updatedUser.setPassword(bCryptPasswordEncoder.encode(rawPassword));
        userRepository.save(updatedUser);
        rp.get().setIsActive(false);
        recoverPasswordService.save(rp.get());
    }

    public void confirmRegistration(String token, HttpServletResponse response) throws IOException {
        Optional<ConfirmationToken> optionalToken = confirmationTokenRepository.findByToken(token);

        if (optionalToken.isEmpty() || !isTokenValid(optionalToken.get().getExpirationDate())) {
            redirectToResendConfirmationEmailPage(response, token);
            return;
        }

        ConfirmationToken confirmationToken = optionalToken.get();
        User user = confirmationToken.getUser();
        user.setIsEnabled(true);
        userRepository.save(user);
        confirmationTokenRepository.deleteById(confirmationToken.getId());

        redirectToSuccessfulRegistrationPage(response, user.getRole());
    }

    public void resendConfirmation(String email, String language) throws DtoValidateException {
        User user = findByUsername(email)
                .orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));

        if (user.getIsEnabled()) {
            throw new DtoValidateException(errorAlreadyConfirmed);
        }

        confirmationTokenRepository.findByUserId(user.getId())
                .ifPresent(token -> confirmationTokenRepository.deleteById(token.getId()));

        String token = generateConfirmationTokenForUser(user);
        String receiverName = getReceiverName(user);

        sendConfirmationEmail(user, token, receiverName, language);
    }

    @Transactional
    public void deleteAccount(List<AccountDeletionReason> accountDeletionReasons) throws DtoValidateException {
        if (accountDeletionReasons.isEmpty()) {
            throw new DtoValidateException(errorEntityValidate);
        }
        String anonymized = "delete_" + LocalDateTime.now();

        User user = getUser();

        user.setUsername(anonymized);
        user.setFirstName(anonymized);
        user.setLastName(anonymized);
        user.setActive(false);
        userRepository.save(user);

        List<DeletedUser> deletedUsers = accountDeletionReasons.stream()
                .map(reason -> new DeletedUser(reason, user))
                .toList();

        deletedUserRepository.saveAll(deletedUsers);
    }

    public void createUser(CreateUserDto createUserDto, String language) throws DtoValidateException {
        String token = UUID.randomUUID().toString().replace("-", "");

        User userToCreate = User.createUserToEntity(createUserDto, principalService.getTenantId(), token);
        userToCreate.setRole(roleRepository.findByName(Role.ROLE_MUNICIPALITY_ADMIN).get());

        try {
            userRepository.save(userToCreate);
        } catch (DataIntegrityViolationException e) {
            throw new DtoValidateException(errorEmailAlreadyUsed);
        }

        String url = baseMunicipalityUrl + "/set-password/" + token;
        emailService.sendEmailAfterUserCreated(url, nl.centric.innovation.local4local.util.StringUtils.getLanguageForLocale(language), userToCreate.getUsername());
    }

    private void enforceRateLimiting(UUID id, String remoteAddress) throws RecoverException {
        if (recoverPasswordService.countAllByUserInLastDay(id) >= ATTEMPTS_LIMIT) {
            throw new RecoverException(errorRecoveryExceeded);
        }

        Optional<LoginAttempt> loginAttempt = loginAttemptService.findByRemoteAddress(remoteAddress);
        loginAttemptService.countLoginAttempts(loginAttempt, remoteAddress, true);
    }

    private void validateCaptcha(String reCaptchaResponse, String remoteAddress) throws CaptchaException {
        if (StringUtils.isBlank(reCaptchaResponse) || !captchaService.isResponseValid(reCaptchaResponse, remoteAddress)) {
            throw new CaptchaException(errorCaptchaShow);
        }
    }

    private User getUserByEmail(String email) throws DtoValidateException {
        return findByUsername(email).orElseThrow(() -> new DtoValidateNotFoundException(errorEntityNotFound));
    }

    private void sendRecoveryEmail(User user, String language, RecoverPassword recoverPassword) {
        boolean isSupplierUser = user.getRole().getName().equals(Role.ROLE_SUPPLIER);
        String url = getBaseUrl(isSupplierUser, baseUrl, baseMunicipalityUrl) + RESET_URL + recoverPassword.getToken();
        emailService.sendPasswordRecoveryEmail(url, new String[]{user.getUsername()}, language);
    }

    private void validateEmailAndPassword(String password, String retypePassword) throws DtoValidateException {
        if (!password.equals(retypePassword)) {
            throw new DtoValidateException(errorPasswordMismatch);
        }
        if (!isPasswordValid(password)) {
            throw new DtoValidateException(errorPasswordRequirements);
        }
    }

    private User validateAndReturnSupplier(RegisterUserDto registerUserDto) throws DtoValidateException {
        validateEmailAndPassword(registerUserDto.password(), registerUserDto.retypedPassword());

        User user = ModelConverter.registerUserToEntity(registerUserDto);
        user.setPassword(passwordEncoder.encode(registerUserDto.password()));
        return user;
    }

    private User validateAndReturnCitizen(RegisterCitizenUserDto citizenUserDto) throws DtoValidateException {
        validateEmailAndPassword(citizenUserDto.password(), citizenUserDto.retypedPassword());

        User user = ModelConverter.registerCitizenToEntity(citizenUserDto);
        user.setPassword(passwordEncoder.encode(citizenUserDto.password()));
        return user;
    }

    private boolean isPasswordValid(String password) {
        String regexPattern = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[~`!@#$%^&*()_\\-+={[}]|\\\\:;\"'<,>.?/])(.{8,})$";

        return Pattern.compile(regexPattern).matcher(password).matches();
    }

    private void validateEmail(String email) throws DtoValidateException {
        try {
            InternetAddress address = new InternetAddress(email);
            address.validate();
        } catch (AddressException e) {
            log.error("Invalid email address submitted {}", email, e);
            throw new DtoValidateException(errorMailRequirements);
        }
    }

    private String manageConfirmationToken(User user) throws DtoValidateAlreadyExistsException {
        Optional<ConfirmationToken> confirmationTokenByUser = confirmationTokenRepository.findByUserId(user.getId());

        if (confirmationTokenByUser.isPresent()) {
            throw new DtoValidateAlreadyExistsException(errorUniqueViolation);
        }

        return generateConfirmationTokenForUser(user);
    }

    private boolean isTokenValid(LocalDateTime expiryDate) {
        return expiryDate != null && expiryDate.isAfter(LocalDateTime.now());
    }

    private String generateConfirmationTokenForUser(User user) {
        return confirmationTokenService.save(new ConfirmationToken(user)).getToken();
    }

    private void sendConfirmationEmail(User user, String token, String receiver, String language) {
        String url = backendBaseUrl + "/users/confirm-account/" + token;
        emailService.sendConfirmAccountEmail(url, nl.centric.innovation.local4local.util.StringUtils.getLanguageForLocale(language), receiver, user.getUsername());
    }

    private void redirectToSuccessfulRegistrationPage(HttpServletResponse response, Role role) throws IOException {
        String url = baseUrl + "/registration-successful?is-citizen=" + (role.equals(Role.ROLE_CITIZEN) ? "true" : "false");
        response.sendRedirect(url);
    }

    private void redirectToResendConfirmationEmailPage(HttpServletResponse response, String token) throws IOException {
        response.sendRedirect(baseUrl + "/resend-confirmation-email/" + token);
    }

    private String getReceiverName(User user) {
        return user.getRole().getName().equals(Role.ROLE_CITIZEN) ?
                user.getFirstName() : user.getSupplier().getCompanyName();
    }

    private void validateCitizenEmail(RegisterCitizenUserDto registerCitizenUserDto) throws DtoValidateException {
        if (userRepository.findByUsernameIgnoreCase(registerCitizenUserDto.email()).isPresent()) {
            throw new DtoValidateAlreadyExistsException(errorUniqueViolation);
        }
    }

    private User createAndSaveCitizen(RegisterCitizenUserDto registerCitizenUserDto, Passholder passholder, Role role) throws DtoValidateException {
        User user = validateAndReturnCitizen(registerCitizenUserDto);
        user.setRole(role);
        user.setIsEnabled(false);
        user.setTenantId(passholder.getTenant().getId());
        return userRepository.save(user);
    }

    private void sendConfirmation(User user, String language) {
        String token = generateConfirmationTokenForUser(user);
        sendConfirmationEmail(user, token, user.getFirstName(), language);
    }

    private User getUser() {
        return principalService.getUser();
    }
}
