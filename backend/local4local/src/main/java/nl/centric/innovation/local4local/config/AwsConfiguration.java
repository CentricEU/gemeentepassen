package nl.centric.innovation.local4local.config;

import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import org.springframework.util.StringUtils;

@Configuration
public class AwsConfiguration {

    @Value("${aws.access_key:}")
    private String accessKey;

    @Value("${aws.secret_key:}")
    private String secretKey;

    @Bean
    public SesV2Client sesClient() {
        return SesV2Client.builder()
                .credentialsProvider(awsCredentialsProvider())
                .region(Region.EU_CENTRAL_1)
                .build();
    }

    @Bean
    public AmazonS3 amazonS3() {
        return AmazonS3ClientBuilder
                .standard()
                .withCredentials(awsStaticCredentialsProvider())
                .withRegion(Regions.EU_WEST_2)
                .build();
    }

    private AWSCredentialsProvider awsStaticCredentialsProvider() {
        if (hasStaticCredentials()) {
            BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
            return new AWSStaticCredentialsProvider(credentials);
        }

        return DefaultAWSCredentialsProviderChain.getInstance();
    }

    private AwsCredentialsProvider awsCredentialsProvider() {
        if (hasStaticCredentials()) {
            return StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
            );
        }

        return DefaultCredentialsProvider.create();
    }

    private boolean hasStaticCredentials() {
        return StringUtils.hasText(accessKey) && StringUtils.hasText(secretKey);
    }
}
