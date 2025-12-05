package nl.centric.innovation.local4local.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class LocalDateParser {
	private static final DateTimeFormatter[] formats = new DateTimeFormatter[] { DateTimeFormatter.ofPattern("dd/MM/yyyy"),
			DateTimeFormatter.ofPattern("dd.MM.yyyy"), DateTimeFormatter.ofPattern("dd-MM-yyyy") };

	public Optional<LocalDate> parseDateString(String input) {
		for (var format : formats) {
			try {
				LocalDate localDate = LocalDate.parse(input, format);
				return Optional.of((localDate));
			} catch (DateTimeParseException ex) {
				// Skip exception, and try with next format
			}
		}

		return Optional.empty();
	}
}
