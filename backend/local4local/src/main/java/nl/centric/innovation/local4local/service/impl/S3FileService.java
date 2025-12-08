package nl.centric.innovation.local4local.service.impl;

import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.exceptions.FilesUploadException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class S3FileService {

    private final AmazonS3 s3Service;

    @Value("${cloud.aws.s3.bucketName}")
    private String s3BucketName;

    @Value("${error.documents.upload}")
    private String errorDocumentsUpload;

    /**
     * Uploads all non-empty files to S3 under the given key prefix.
     *
     * @param s3KeyPrefix e.g. "8e2e6c3b-4a4d-4e49-a4c5-7cbdb03b3d7f/3e91f5c9-1c48-4ab7-b5d5-76d23a10a5ee"
     * @param files       the list of files to upload
     * @return list of uploaded S3 keys
     */
    public List<String> uploadFilesToS3(String s3KeyPrefix, List<MultipartFile> files) throws FilesUploadException {
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        try {
            return files.stream()
                    .filter(file -> file.getSize() > 0)
                    .map(file -> {
                        String s3FileKey = s3KeyPrefix + "/" + file.getOriginalFilename();
                        try {
                            uploadFile(s3FileKey, file);
                            return s3FileKey;
                        } catch (IOException | SdkClientException e) {
                            throw new RuntimeException(e);
                        }
                    })
                    .toList();
        } catch (RuntimeException e) {
            if (e.getCause() instanceof IOException || e.getCause() instanceof SdkClientException) {
                throw new FilesUploadException(errorDocumentsUpload);
            }
            throw e;
        }
    }

    /**
     * Uploads a single file to S3.
     */
    private void uploadFile(String s3FileKey, MultipartFile file) throws IOException, SdkClientException {
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());

        s3Service.putObject(s3BucketName, s3FileKey, file.getInputStream(), metadata);
    }
}
