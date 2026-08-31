import { Locator, Page } from "@playwright/test";
import { BasePage } from "../common/basePage";
import { Dropdown } from "../../page-objects/common/dropdown";
import { registerSupplierTestData } from "../../utils/test-data";

export default class RegisterSupplierPage extends BasePage {
    readonly firstName :Locator;
    readonly lastName :Locator;
    readonly companyName :Locator;
    readonly kvkNumber :Locator;
    readonly email :Locator;
    readonly password :Locator;
    readonly confirmPassword :Locator;
    readonly municipalityDropdown : Locator;
    readonly registerButton : Locator;
    private dropdown: Dropdown;
    private termsCheckbox: Locator;


    constructor(page:Page) {      
        super(page); 
        this.firstName = page.locator('windmill-input[formcontrolname="firstName"] input');
        this.lastName = page.locator('windmill-input[formcontrolname="lastName"] input');
        this.companyName = page.locator('windmill-input[formcontrolname="company"] input');
        this.kvkNumber = page.locator('windmill-input[formcontrolname="kvkNumber"] input');
        this.email = page.locator('windmill-input[formcontrolname="email"] input');
        this.password = page.locator('windmill-input[formcontrolname="password"] input');
        this.confirmPassword = page.locator('windmill-input[formcontrolname="confirmPassword"] input');
        this.municipalityDropdown = page.locator('windmill-dropdown-search[formcontrolname="municipality"]');
        this.registerButton = page.locator('centric-button button[type="submit"]');
        this.dropdown = new Dropdown(page);
        this.termsCheckbox = page.locator('input[type="checkbox"]');
    }
   

    async register(): Promise<void> {
        await this.firstName.fill(registerSupplierTestData.firstName);
        await this.lastName.fill(registerSupplierTestData.lastName);
        await this.companyName.fill(registerSupplierTestData.companyName);
        await this.kvkNumber.fill(registerSupplierTestData.kvkNumber);
        await this.email.fill(registerSupplierTestData.email);
        await this.password.fill(registerSupplierTestData.password);
        await this.confirmPassword.fill(registerSupplierTestData.confirmPassword);
        await this.dropdown.selectSearchOption(registerSupplierTestData.municipality);
        await this.termsCheckbox.check();
        await this.registerButton.click();
    }

}

