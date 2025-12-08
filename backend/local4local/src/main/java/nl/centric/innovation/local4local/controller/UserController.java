package nl.centric.innovation.local4local.controller;


import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.AccountDeletionReasonsDto;
import nl.centric.innovation.local4local.dto.ChangePasswordDTO;
import nl.centric.innovation.local4local.dto.CitizenViewDto;
import nl.centric.innovation.local4local.dto.CreateUserDto;
import nl.centric.innovation.local4local.dto.RecoverPasswordDTO;
import nl.centric.innovation.local4local.dto.RegisterCitizenUserDto;
import nl.centric.innovation.local4local.dto.SetupPasswordDTO;
import nl.centric.innovation.local4local.dto.SetupPasswordValidateDTO;
import nl.centric.innovation.local4local.dto.UserProfileDto;
import nl.centric.innovation.local4local.dto.UserTableDto;
import nl.centric.innovation.local4local.dto.UserViewDto;
import nl.centric.innovation.local4local.entity.RecoverPassword;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.exceptions.CaptchaException;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.PasswordSameException;
import nl.centric.innovation.local4local.exceptions.RecoverException;
import nl.centric.innovation.local4local.security.SecurityUtils;
import nl.centric.innovation.local4local.service.impl.UserProfileService;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.service.interfaces.RecoverPasswordService;
import nl.centric.innovation.local4local.util.CommonUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    private final RecoverPasswordService recoverPasswordService;

    private final UserProfileService userProfileService;


    @Value("${local4local.server.name}")
    private String baseURL;

    @GetMapping
    public ResponseEntity<UserViewDto> getByUserId(@RequestParam UUID userId) throws DtoValidateException {
        return ResponseEntity.ok(userService.findByUserId(userId));
    }

    // Citizen endpoints
    @PostMapping("/register")
    public ResponseEntity<CitizenViewDto> saveCitizen(@RequestBody @Valid RegisterCitizenUserDto registerCitizenUserDto,
                                                      @RequestHeader(value = "Accept-Language", required = false, defaultValue = "nl-NL") String language) throws DtoValidateException {
        return ResponseEntity.ok(userService.saveCitizen(registerCitizenUserDto, language));
    }

    @PostMapping("/delete-account")
    @Operation(
            summary = "Delete user account",
            description = "Deletes the account of the currently logged-in user, providing reasons for deletion."
    )
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<Void> deleteAccount(@RequestBody AccountDeletionReasonsDto accountDeletionReasonsDto) throws DtoValidateException {
        userService.deleteAccount(accountDeletionReasonsDto.accountDeletionReasons());

        return ResponseEntity.ok().build();
    }

    @GetMapping("/citizen-profile")
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<UserProfileDto> getCitizenProfile() throws DtoValidateException {
        return ResponseEntity.ok(userProfileService.findByUserId());
    }

    @PostMapping("/citizen-profile")
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<UserProfileDto> updateCitizenProfile(@RequestBody UserProfileDto userProfileDto) throws DtoValidateException {
        UserProfileDto citizenUser = userProfileService.save(userProfileDto);
        return ResponseEntity.ok(citizenUser);
    }

    // Reset password endpoints
    @PostMapping("/recover")
    @Operation(
            summary = "Recover password",
            description = "Initiates the password recovery process for a user. " +
                    "Sends a recovery email if the provided email is associated with an account. " +
                    "Returns no content if successful."
    )
    public ResponseEntity<String> recoverPassword(@Valid @RequestBody RecoverPasswordDTO recoverPasswordDTO,
                                                  @RequestHeader(value = "Accept-Language", required = false, defaultValue = "nl-NL") String citizenLang,
                                                  @CookieValue(value = "language_supplier", required = false, defaultValue = "nl-NL") String supplierLang,
                                                  @CookieValue(value = "language_municipality", required = false, defaultValue = "nl-NL") String municipalityLang,
                                                  HttpServletRequest httpRequest)
            throws DtoValidateException, RecoverException, CaptchaException {

        String remoteAddress = SecurityUtils.getClientIP(httpRequest);
        String language = CommonUtils.selectLanguage(recoverPasswordDTO.role(), supplierLang, municipalityLang, citizenLang);
        userService.recoverPassword(recoverPasswordDTO, remoteAddress, language );
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recover")
    @Operation(
            summary = "Get recover password by token",
            description = "Retrieves the recover password details associated with the provided token. " +
                    "Returns the recover password entity if found."
    )
    public ResponseEntity<RecoverPassword> getByToken(@RequestParam String token) throws DtoValidateException, RecoverException {
        Optional<RecoverPassword> recoverPassword = recoverPasswordService.findRecoverPasswordByToken(token);
        return ResponseEntity.ok(recoverPassword.get());
    }

    @PutMapping("/recover/reset-password")
    @Operation(
            summary = "Change password using recover token",
            description = "Allows a user to change their password using a valid recovery token. " +
                    "Returns no content if successful."
    )
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordDTO changePasswordDTO) throws RecoverException, DtoValidateException, PasswordSameException {
        userService.changePassword(changePasswordDTO.token(), changePasswordDTO.password());
        return ResponseEntity.noContent().build();
    }

    // Confirm account endpoints
    @GetMapping("/confirm-account/{token}")
    @Operation(
            summary = "Confirm user registration",
            description = "Confirms the registration of a user using the provided token. " +
                    "Redirects to a specified URL upon successful confirmation."
    )
    public ResponseEntity<Void> confirmRegistration(@PathVariable("token") String token, HttpServletResponse response) throws IOException {
        userService.confirmRegistration(token, response);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/resend-confirmation")
    @Operation(
            summary = "Resend confirmation email",
            description = "Resends the account confirmation email to the specified email address."
    )
    public ResponseEntity<Void> resendConfirmation(@RequestParam("email") String email,
                                                   @CookieValue(value = "language_supplier", required = false, defaultValue = "nl-NL") String language) throws DtoValidateException {

        userService.resendConfirmation(email, language);
        return ResponseEntity.ok().build();
    }

    // Admin endpoints
    @PostMapping("/create")
    @Operation(
            summary = "Create a new user",
            description = "Create a new user with the given information"
    )
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Void> createUser(@RequestBody @Valid CreateUserDto createUserDto,
                                           @CookieValue(value = "language_municipality", defaultValue = "nl-NL") String language)
            throws DtoValidateException {
        userService.createUser(createUserDto, language);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admins/paginated")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    @Operation(
            summary = "Retrieve paginated admin list without the logged in admin",
            description = "Allows a Municipality Admin to retrieve a paginated list of admins associated with the tenant of the logged in admin."
    )

    public ResponseEntity<List<UserTableDto>> getAllAdminsByTenantIdPaginated(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "25") Integer size) throws DtoValidateException {
        return ResponseEntity.ok(userService.getAllAdminsByTenantIdPaginated(page, size));
    }

    @GetMapping("/admins/count")
    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    @Operation(
            summary = "Retrieve the number of admins without the logged in admin",
            description = "Allows a Municipality Admin to retrieve the total number of admins without him."
    )
    public ResponseEntity<Integer> countAdminsByTenantId() throws DtoValidateException {
        return ResponseEntity.ok(userService.countAllAdminsByTenantId());
    }

    @PutMapping("/setup-password")
    @Operation(
            summary = "Set up a new password",
            description = "Allows a user to set up a new password using a valid setup token. " +
                    "Returns no content if successful."
    )
    public ResponseEntity<String> setupPassword(@Valid @RequestBody SetupPasswordDTO setupPasswordDTO) throws RecoverException, DtoValidateException, PasswordSameException {
        userService.setupPassword(setupPasswordDTO);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/setup-password/validate")
    @Operation(
            summary = "Validate setup password token",
            description = "Validates if the provided setup password token is valid. " +
                    "Returns true if valid, false otherwise."
    )
    public ResponseEntity<Boolean> validateToken(@Valid @RequestBody SetupPasswordValidateDTO setupPasswordValidateDTO) throws RecoverException, DtoValidateException, PasswordSameException {
        boolean isValid = userService.validateToken(setupPasswordValidateDTO);
        return ResponseEntity.ok(isValid);
    }

}
