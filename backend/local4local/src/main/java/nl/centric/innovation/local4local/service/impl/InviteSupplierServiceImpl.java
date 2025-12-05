package nl.centric.innovation.local4local.service.impl;


import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.InvitationDto;
import nl.centric.innovation.local4local.dto.InviteSupplierDto;
import nl.centric.innovation.local4local.entity.InviteSupplier;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.InviteSupplierRepository;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import nl.centric.innovation.local4local.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@PropertySource({"classpath:errorcodes.properties"})
public class InviteSupplierServiceImpl {

    private final InviteSupplierRepository inviteSupplierRepository;
    private final UserService userService;
    private final EmailService emailService;
    private final TenantService tenantService;
    private final PrincipalService principalService;

    @Value("${error.constraint.tooMany}")
    private String errorTooManyEmails;

    @Value("${local4local.server.name}")
    private String baseURL;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Value("${error.constraint.duplicate}")
    private String duplicateValue;

    @Value("${error.general.entityValidate}")
    private String errorEntityValidate;

    public List<InvitationDto> getAllLatestSentToEmailByTenantId(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<InviteSupplier> invitations = inviteSupplierRepository.findAllByTenantIdAndIsActiveTrueOrderByCreatedDateDesc(tenantId(), pageable);

        return invitations.stream().map(InvitationDto::invitationEntityToDto).collect(Collectors.toList());
    }

    public Integer countByTenantId() {
        return inviteSupplierRepository.countByTenantIdAndIsActiveTrue(tenantId());
    }

    public void inviteSupplier(InviteSupplierDto inviteSupplierDto, String language)
            throws DtoValidateException {


        Tenant tenant = validateInvitationMessage(inviteSupplierDto);

        Set<String> processedEmails = new HashSet<>();

        for (String email : inviteSupplierDto.emails()) {
            processEmail(email, inviteSupplierDto, tenant, language, processedEmails);
        }
    }

    private Tenant validateInvitationMessage(InviteSupplierDto inviteSupplierDto) throws DtoValidateException {
        if (inviteSupplierDto.emails().size() > 50 || inviteSupplierDto.emails().isEmpty()) {
            throw new DtoValidateException(errorTooManyEmails);
        }

        if (inviteSupplierDto.message().length() > 1024 || inviteSupplierDto.message().isEmpty()) {
            throw new DtoValidateException(errorEntityValidate);
        }

        Optional<Tenant> tenant = tenantService.findByTenantId(tenantId());

        if (tenant.isEmpty()) {
            throw new DtoValidateNotFoundException(errorEntityNotFound);
        }

        return tenant.get();
    }

    private void processEmail(String email, InviteSupplierDto inviteSupplierDto, Tenant tenant, String language, Set<String> processedEmails)
            throws DtoValidateException {
        validateEmail(email, processedEmails);
        if (isUserPresent(email)) {
            return;
        }
        saveInviteSupplier(email, inviteSupplierDto, tenant.getId());
        sendInviteEmail(email, inviteSupplierDto, tenant, language);
        processedEmails.add(email);
    }

    private void validateEmail(String email, Set<String> processedEmails) throws DtoValidateException {
        if (processedEmails.contains(email)) {
            throw new DtoValidateException(duplicateValue);
        }
    }

    private boolean isUserPresent(String email) {
        Optional<User> user = userService.findByUsername(email);
        return user.isPresent();
    }

    private void saveInviteSupplier(String email, InviteSupplierDto inviteSupplierDto, UUID tenantId) {
        InviteSupplier inviteSupplier = InviteSupplier.createInviteSupplierToEntity(tenantId, email, inviteSupplierDto.message());
        inviteSupplierRepository.save(inviteSupplier);
    }

    private void sendInviteEmail(String email, InviteSupplierDto inviteSupplierDto, Tenant tenant, String language) {
        String tenantName = tenant.getName();
        String url = baseURL + "/register";
        emailService.sendSupplierInviteEmail(url, StringUtils.getLanguageForLocale(language), tenantName, email, inviteSupplierDto.message());
    }

    private UUID tenantId() {
        return principalService.getTenantId();
    }

}
