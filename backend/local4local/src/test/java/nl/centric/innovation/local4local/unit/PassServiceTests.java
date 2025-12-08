package nl.centric.innovation.local4local.unit;

import nl.centric.innovation.local4local.dto.PassDto;
import nl.centric.innovation.local4local.entity.*;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.FilesUploadException;
import nl.centric.innovation.local4local.repository.PassRepository;
import nl.centric.innovation.local4local.service.impl.PassService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import nl.centric.innovation.local4local.service.impl.S3FileService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PassServiceTests {

    @Mock
    private PassRepository passRepository;

    @InjectMocks
    private PassService passService;

    @Mock
    private S3FileService s3FileService;

    @Mock
    private PrincipalService principalService;

    @Mock
    private MultipartFile mockFile;

    @Test
    void save_ShouldSavePass() throws DtoValidateException, FilesUploadException {
        // Given
        PassDto dto = new PassDto(
                "First Name",
                "Last Name",
                java.time.LocalDate.now(),
                "999111333",
                "+1234567890",
                "test@test.com",
                "Need help"
        );

        Pass entity = Pass.fromDto(dto);
        entity.setId(UUID.randomUUID());
        List<MultipartFile> files = List.of(mockFile);

        // When
        when(passRepository.save(any(Pass.class))).thenReturn(entity);
        when(principalService.getTenantId()).thenReturn(UUID.randomUUID());
        when(s3FileService.uploadFilesToS3(anyString(), anyList())).thenReturn(List.of("fileKey"));
        
        ResponseEntity<Void> response = passService.save(dto, files);

        // Then
        verify(passRepository).save(any(Pass.class));
        verify(s3FileService).uploadFilesToS3(anyString(), anyList());
        assertEquals(200, response.getStatusCodeValue());
    }
}