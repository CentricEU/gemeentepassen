package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.PassDto;
import nl.centric.innovation.local4local.entity.Pass;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.FilesUploadException;
import nl.centric.innovation.local4local.repository.PassRepository;
import nl.centric.innovation.local4local.repository.TenantRepository;
import nl.centric.innovation.local4local.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PassService {
    private final TenantRepository tenantRepository;
    private final PassRepository passRepository;
    private final S3FileService s3FileService;
    private final PrincipalService principalService;
    private final CitizenEmailService citizenEmailService;

    @Value("${local4local.server.name}")
    private String baseURL;
    // To-DO: Create CitizenBenefit for Passes when this will be implemented.
    @Transactional
    public ResponseEntity<Void> save(PassDto pass, List<MultipartFile> files) throws DtoValidateException, FilesUploadException {
        var savedPass = passRepository.save(Pass.fromDto(pass));
        var folderName = getTenantId().toString() + "/" + savedPass.getId().toString();

        var saveFilesResult = s3FileService.uploadFilesToS3(folderName, files);
        if (saveFilesResult.isEmpty()) {
            throw new FilesUploadException("No files uploaded!");
        }

        return ResponseEntity.ok().build();
    }

    public void sendSummaryEmailAfterApplyForPass(String language, String email) {
        Optional<Tenant> tenant = tenantRepository.findById(getTenantId());
        citizenEmailService.sendSummaryEmailAfterApplyForPass(email, StringUtils.getLanguageForLocale(language), tenant.get());
    }

    private UUID getTenantId() {
        return principalService.getTenantId();
    }
}
