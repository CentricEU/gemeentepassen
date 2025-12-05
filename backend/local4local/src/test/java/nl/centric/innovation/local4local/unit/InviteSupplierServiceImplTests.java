package nl.centric.innovation.local4local.unit;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.InvitationDto;
import nl.centric.innovation.local4local.dto.InviteSupplierDto;
import nl.centric.innovation.local4local.entity.InviteSupplier;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.repository.InviteSupplierRepository;
import nl.centric.innovation.local4local.service.impl.InviteSupplierServiceImpl;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.UserService;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.service.interfaces.TenantService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@RequiredArgsConstructor
@MockitoSettings(strictness = Strictness.LENIENT)
class InviteSupplierServiceImplTests {

    @Mock
    private InviteSupplierRepository inviteSupplierRepository;

    @InjectMocks
    private InviteSupplierServiceImpl inviteSupplierService;

    @Mock
    private UserService userServiceMock;

    @Mock
    private TenantService tenantService;

    @Mock
    private EmailService emailService;

    @Mock
    private PrincipalService principalService;

    @Value("${error.constraint.tooMany}")
    private String errorTooManyEmails;

    @Value("${error.entity.notfound}")
    private String errorEntityNotFound;

    @Value("${local4local.server.name}")
    private String baseURL;

    @Value("${error.invitation.expired}")
    private String errorInvitationExpired;

    @Test
    void GivenInvalidDto_WhenSave_ShouldReturnErrorEmailsSizeExceedsLimit() {
        // Given
        InviteSupplierDto inviteSupplierDto = InviteSupplierDto.builder().emails(Arrays.asList(new String[51])).build();
        UUID tenantId = UUID.randomUUID();
        String language = "en";

        Tenant mockedTenant = Tenant.builder().name("TestTenant").build();

        when(tenantService.findByTenantId(tenantId)).thenReturn(Optional.of(mockedTenant));

        // When
        DtoValidateException exception = assertThrows(DtoValidateException.class, () ->
                inviteSupplierService.inviteSupplier(inviteSupplierDto, language));

        // Then
        assertEquals(errorTooManyEmails, exception.getMessage());
        verify(inviteSupplierRepository, never()).save(any(InviteSupplier.class));
    }

    @Test
    void GivenNonExistingTenant_WhenSave_ShouldReturnErrorNotExisting() {
        // Given
        InviteSupplierDto inviteSupplierDto = InviteSupplierDto.builder()
                .emails(Arrays.asList("email1@example.com", "email2@example.com"))
                .message("Description")
                .build();
        UUID tenantId = UUID.randomUUID();
        String language = "en";

        when(tenantService.findByTenantId(tenantId)).thenReturn(Optional.empty());
        when(userServiceMock.findByUsername("existingUser@example.com")).thenReturn(Optional.of(new User()));

        // When
        DtoValidateException exception = assertThrows(DtoValidateNotFoundException.class, () ->
                inviteSupplierService.inviteSupplier(inviteSupplierDto, language));

        // Then
        assertEquals(errorEntityNotFound, exception.getMessage());
        verify(inviteSupplierRepository, never()).save(any(InviteSupplier.class));
    }

    @Test
    void GivenInvalidDto_WhenSave_ShouldReturnDtoValidateException() {
        // Given
        InviteSupplierDto inviteSupplierDto = InviteSupplierDto.builder()
                .emails(Arrays.asList("email1@example.com", "email2@example.com"))
                .message("")
                .build();
        UUID tenantId = UUID.randomUUID();
        String language = "en";

        Tenant mockedTenant = Tenant.builder().name("TestTenant").build();

        when(tenantService.findByTenantId(tenantId)).thenReturn(Optional.of(mockedTenant));

        // When
        DtoValidateException exception = assertThrows(DtoValidateException.class, () ->
                inviteSupplierService.inviteSupplier(inviteSupplierDto, language));

        // Then
        assertEquals(errorTooManyEmails, exception.getMessage());
        verify(inviteSupplierRepository, never()).save(any(InviteSupplier.class));
    }

    @Test
    void GivenValidDto_WhenSaveInvite_ThenSaveShouldBeSuccessfull() throws DtoValidateException {
        // Given
        InviteSupplierDto inviteSupplierDto = InviteSupplierDto.builder()
                .message("Description")
                .emails(Arrays.asList("email1@example.com", "email2@example.com"))
                .build();
        UUID tenantId = UUID.randomUUID();

        Tenant mockedTenant = Tenant.builder().name("TestTenant").build();

        when(tenantService.findByTenantId(tenantId)).thenReturn(Optional.of(mockedTenant));
        String language = "en";
        when(userServiceMock.findByUsername("email1@example.com")).thenReturn(Optional.empty());
        when(userServiceMock.findByUsername("email2@example.com")).thenReturn(Optional.empty());
        when(principalService.getTenantId()).thenReturn(tenantId);

        doNothing().when(emailService).sendSupplierInviteEmail(any(), any(), any(), any(), any());

        // When
        inviteSupplierService.inviteSupplier(inviteSupplierDto, language);

        // Then
        verify(inviteSupplierRepository, times(2)).save(any(InviteSupplier.class));
        verify(emailService, times(2)).sendSupplierInviteEmail(any(), any(), any(), any(), any());
    }

    @Test
    void GivenExistingUser_WhenTriesToSendInvite_ShouldNotSent() throws DtoValidateException {
        // Given
        InviteSupplierDto inviteSupplierDto = InviteSupplierDto.builder()
                .message("Description")
                .emails(Arrays.asList("existingUser@example.com"))
                .build();

        UUID tenantId = UUID.randomUUID();
        String language = "en";

        Tenant mockedTenant = Tenant.builder().name("TestTenant").build();

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantService.findByTenantId(tenantId)).thenReturn(Optional.of(mockedTenant));
        when(userServiceMock.findByUsername("existingUser@example.com")).thenReturn(Optional.of(new User()));

        // When
        inviteSupplierService.inviteSupplier(inviteSupplierDto, language);

        // Then
        verify(inviteSupplierRepository, never()).save(any(InviteSupplier.class));
    }

    private static final String DUPLICATE_EMAIL_ERROR_MESSAGE = "Duplicate email address found";

    @Test
    void GivenDuplicateEmail_WhenSave_ShouldThrowDtoValidateException() {
        // Given
        String duplicateEmail = "duplicate@example.com";
        InviteSupplierDto inviteSupplierDto = InviteSupplierDto.builder()
                .emails(Arrays.asList("email1@example.com", duplicateEmail, "email2@example.com", duplicateEmail))
                .message("Description")
                .build();
        UUID tenantId = UUID.randomUUID();
        String language = "en";

        Tenant mockedTenant = Tenant.builder().name("TestTenant").build();
        when(tenantService.findByTenantId(tenantId)).thenReturn(Optional.of(mockedTenant));

        // When/Then
        DtoValidateException exception = assertThrows(DtoValidateException.class, () ->
                inviteSupplierService.inviteSupplier(inviteSupplierDto, language));

        assertEquals(null, exception.getMessage());
    }

    @Test
    void GivenValidTenantId_WhenGetAllByTenantId_ThenInvitationDtosReturned() {
        // Given
        UUID tenantId = UUID.randomUUID();
        Tenant mockedTenant = Tenant.builder().name("TestTenant").build();

        List<InviteSupplier> mockInvitationsList = List.of(new InviteSupplier(), new InviteSupplier());
        Page<InviteSupplier> mockInvitationsPage = new PageImpl<>(mockInvitationsList);

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantService.findByTenantId(tenantId)).thenReturn(Optional.of(mockedTenant));
        when(inviteSupplierRepository.findAllByTenantIdAndIsActiveTrueOrderByCreatedDateDesc(tenantId, PageRequest.of(0, 25)))
                .thenReturn(mockInvitationsPage);

        // When
        List<InvitationDto> invitationDtos = inviteSupplierService.getAllLatestSentToEmailByTenantId(0, 25);

        // Then
        assertNotNull(invitationDtos);
        assertEquals(mockInvitationsList.size(), invitationDtos.size());
    }

    @Test
    void GivenValidTenantId_WhenCountByTenantId_ThenShouldCount() {
        UUID tenantId = UUID.randomUUID();
        Tenant mockedTenant = Tenant.builder().name("TestTenant").build();

        when(principalService.getTenantId()).thenReturn(tenantId);
        when(tenantService.findByTenantId(tenantId)).thenReturn(Optional.of(mockedTenant));
        when(inviteSupplierRepository.countByTenantIdAndIsActiveTrue(tenantId)).thenReturn(5);

        Integer invitationsCount = inviteSupplierService.countByTenantId();

        assertEquals(5, invitationsCount);
    }

}
