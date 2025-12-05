package nl.centric.innovation.local4local;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Profile;

@SpringBootTest
class Local4localApplicationTests {

	@Test
	@Profile("development")
	void contextLoads() {
	}

}
