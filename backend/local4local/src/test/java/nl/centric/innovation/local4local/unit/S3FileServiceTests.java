package nl.centric.innovation.local4local.unit;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import nl.centric.innovation.local4local.exceptions.FilesUploadException;
import nl.centric.innovation.local4local.service.impl.S3FileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class S3FileServiceTests {

    @Mock
    private AmazonS3 amazonS3;

    @Mock
    private MultipartFile file1;
    @Mock
    private MultipartFile file2;
    @Mock
    private MultipartFile emptyFile;

    @InjectMocks
    private S3FileService s3FileService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Inject values for @Value fields (testing approach: reflection)
        TestUtils.injectValue(s3FileService, "s3BucketName", "test-bucket");
        TestUtils.injectValue(s3FileService, "errorDocumentsUpload", "error uploading files");
    }

    @Test
    void givenEmptyFileList_whenUploadFilesToS3_thenReturnEmptyList() throws FilesUploadException {
        // Given
        List<MultipartFile> files = List.of();

        // When
        List<String> keys = s3FileService.uploadFilesToS3("keyprefix", files);

        // Then
        assertTrue(keys.isEmpty());
        verifyNoInteractions(amazonS3);
    }

    @Test
    void givenFilesIncludingEmpty_whenUploadFilesToS3_thenSkipEmptyAndUploadNonEmpty() throws Exception {
        // Given
        when(file1.getOriginalFilename()).thenReturn("doc1.txt");
        when(file1.getSize()).thenReturn(10L);
        when(file1.getContentType()).thenReturn("text/plain");
        when(file1.getInputStream()).thenReturn(new ByteArrayInputStream("hello".getBytes()));

        when(file2.getOriginalFilename()).thenReturn("doc2.txt");
        when(file2.getSize()).thenReturn(20L);
        when(file2.getContentType()).thenReturn("text/plain");
        when(file2.getInputStream()).thenReturn(new ByteArrayInputStream("world".getBytes()));

        when(emptyFile.getOriginalFilename()).thenReturn("empty.txt");
        when(emptyFile.getSize()).thenReturn(0L);

        List<MultipartFile> files = List.of(file1, file2, emptyFile);

        // When
        List<String> keys = s3FileService.uploadFilesToS3("prefix", files);

        // Then
        assertEquals(2, keys.size());
        assertTrue(keys.get(0).endsWith("doc1.txt"));
        assertTrue(keys.get(1).endsWith("doc2.txt"));
        verify(amazonS3).putObject(eq("test-bucket"), eq("prefix/doc1.txt"), any(), any(ObjectMetadata.class));
        verify(amazonS3).putObject(eq("test-bucket"), eq("prefix/doc2.txt"), any(), any(ObjectMetadata.class));
        verify(amazonS3, times(2)).putObject(anyString(), anyString(), any(), any(ObjectMetadata.class));
        verifyNoMoreInteractions(amazonS3);
    }

    @Test
    void givenUploadFails_whenUploadFilesToS3_thenThrowsFilesUploadException() throws Exception {
        // Given
        when(file1.getOriginalFilename()).thenReturn("fail.txt");
        when(file1.getSize()).thenReturn(12L);
        when(file1.getContentType()).thenReturn("text/plain");
        when(file1.getInputStream()).thenReturn(new ByteArrayInputStream("fail".getBytes()));
        List<MultipartFile> files = List.of(file1);

        doThrow(new SdkClientException("S3 error")).when(amazonS3)
                .putObject(anyString(), anyString(), any(), any(ObjectMetadata.class));

        // When/Then
        FilesUploadException ex = assertThrows(FilesUploadException.class,
                () -> s3FileService.uploadFilesToS3("prefix", files));
        assertEquals("error uploading files", ex.getMessage());

        verify(amazonS3).putObject(eq("test-bucket"), eq("prefix/fail.txt"), any(), any(ObjectMetadata.class));
    }

    // Utility class to inject values into private fields (@Value simulation)
    static class TestUtils {
        static void injectValue(Object target, String field, Object value) {
            try {
                var f = target.getClass().getDeclaredField(field);
                f.setAccessible(true);
                f.set(target, value);
            } catch (Exception e) { throw new RuntimeException(e); }
        }
    }
}