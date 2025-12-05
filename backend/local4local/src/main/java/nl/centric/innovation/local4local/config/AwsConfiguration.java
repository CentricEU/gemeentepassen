package nl.centric.innovation.local4local.config;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AwsConfiguration {

    @Value("${aws.access_key}")
    private String accessKey;

    @Value("${aws.secret_key}")
    private String secretKey;

    @Bean
    public AmazonSimpleEmailService amazonSimpleEmailService() {

        return AmazonSimpleEmailServiceClientBuilder.standard()
                .withCredentials(awstStaticCredentialsProvider())
                .withRegion(Regions.EU_CENTRAL_1)
                .build();
    }

    @Bean
    public AmazonS3 amazonS3() {
        return AmazonS3ClientBuilder
                .standard()
                .withCredentials(awstStaticCredentialsProvider())
                .withRegion(Regions.EU_WEST_2)
                .build();
    }

    @Bean
    public AWSStaticCredentialsProvider awstStaticCredentialsProvider() {
        BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
        return new AWSStaticCredentialsProvider(credentials);
    }
}
