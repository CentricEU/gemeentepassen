package nl.centric.innovation.local4local.util;

import org.apache.commons.lang3.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Base64;
import java.util.regex.Pattern;

public class Validators {

    public static boolean isKvkValid(String number) {
        String regexPattern = "^[0-9]{8}$";

        return Pattern.compile(regexPattern)
                .matcher(number)
                .matches();
    }

    public static boolean isZipCodeValid(String zipCode) {
        String regexPattern = "\\d{4}(\\s?)[A-Za-z]{2}";

        return Pattern.compile(regexPattern)
                .matcher(zipCode)
                .matches();
    }

    public static boolean isTelephoneValid(String telephone) {
        if (StringUtils.isBlank(telephone)) {
            return true;
        }

        String regexPattern = "\\+31\\d{9}$";

        return Pattern.compile(regexPattern)
                .matcher(telephone)
                .matches();
    }

    public static boolean isImageSizeValid(int maxSizeInBytes, String base64Image) {
        if (base64Image == null || base64Image.isEmpty()) {
            return true;
        }

        try {
            byte[] imageData = Base64.getDecoder().decode(base64Image);
            int imageSizeInBytes = imageData.length;

            return imageSizeInBytes <= maxSizeInBytes * 1024;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

}
