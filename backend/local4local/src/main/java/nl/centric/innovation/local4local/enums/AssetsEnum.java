package nl.centric.innovation.local4local.enums;

public enum AssetsEnum {

    LOCAL_LOGO("/assets/images/tilburg-logo.png");

    private final String path;

    AssetsEnum(String path) {
        this.path = path;
    }

    public String getPath() {
        return path;
    }
}
