package nl.centric.innovation.local4local.controller;


import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.AccountDeletionReasonsDto;
import nl.centric.innovation.local4local.dto.ChangePasswordDTO;
import nl.centric.innovation.local4local.dto.CitizenViewDto;
import nl.centric.innovation.local4local.dto.CreateUserDto;
import nl.centric.innovation.local4local.dto.RecoverPasswordDTO;
import nl.centric.innovation.local4local.dto.RegisterCitizenUserDto;
import nl.centric.innovation.local4local.dto.UserProfileDto;
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
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.RecoverPasswordService;
import nl.centric.innovation.local4local.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    private final EmailService emailService;

    private final RecoverPasswordService recoverPasswordService;

    private final UserProfileService userProfileService;

    @Value("${local4local.server.name}")
    private String baseURL;

    @GetMapping
    public ResponseEntity<UserViewDto> getByUserId(@RequestParam UUID userId) throws DtoValidateException {
        return ResponseEntity.ok(userService.findByUserId(userId));
    }

    @PostMapping("/register")
    public ResponseEntity<CitizenViewDto> saveCitizen(@RequestBody RegisterCitizenUserDto registerCitizenUserDto,
                                                      @CookieValue(value = "language", required = false) String language) throws DtoValidateException {
        return ResponseEntity.ok(userService.saveCitizen(registerCitizenUserDto, language));
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

    @PostMapping("/recover")
    public ResponseEntity<String> recoverPassword(@Valid @RequestBody RecoverPasswordDTO recoverPasswordDTO,
                                                  @CookieValue(value = "language", defaultValue = "en-US")
                                                  String locale, HttpServletRequest httpRequest)
            throws DtoValidateException, RecoverException, CaptchaException {

        String remoteAddress = SecurityUtils.getClientIP(httpRequest);
        String language = StringUtils.getLanguageForLocale(locale);

        userService.recoverPassword(recoverPasswordDTO, remoteAddress, language);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/recover/reset-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordDTO changePasswordDTO) throws RecoverException, DtoValidateException, PasswordSameException {
        userService.changePassword(changePasswordDTO.token(), changePasswordDTO.password());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recover")
    public ResponseEntity<RecoverPassword> getByToken(@RequestParam String token) throws DtoValidateException, RecoverException {
        Optional<RecoverPassword> recoverPassword = recoverPasswordService.findRecoverPasswordByToken(token);
        return ResponseEntity.ok(recoverPassword.get());
    }

    @GetMapping("/confirm-account/{token}")
    public ResponseEntity<Void> confirmRegistration(@PathVariable("token") String token, HttpServletResponse response) throws IOException {
        userService.confirmRegistration(token, response);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/resend-confirmation")
    public ResponseEntity<Void> resendConfirmation(@RequestParam("email") String email,
                                                   @CookieValue(value = "language", defaultValue = "nl-NL")
                                                   String language) throws DtoValidateException {
        userService.resendConfirmation(email, language);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/delete-account")
    @Secured({Role.ROLE_CITIZEN})
    public ResponseEntity<Void> deleteAccount(@RequestBody AccountDeletionReasonsDto accountDeletionReasonsDto) throws DtoValidateException {
        userService.deleteAccount(accountDeletionReasonsDto.accountDeletionReasons());

        return ResponseEntity.ok().build();
    }

    @PostMapping("/create")
    @Operation(
            summary = "Create a new user",
            description = "Create a new user with the given information"
    )

    @Secured({Role.ROLE_MUNICIPALITY_ADMIN})
    public ResponseEntity<Void> createUser(@RequestBody @Valid CreateUserDto createUserDto,
                                           @CookieValue(value = "language", defaultValue = "nl-NL") String language)
            throws DtoValidateException {
        userService.createUser(createUserDto, language);

        return ResponseEntity.noContent().build();
    }
}
