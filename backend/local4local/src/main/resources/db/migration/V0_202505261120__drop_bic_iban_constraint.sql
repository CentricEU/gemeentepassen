-- Drop the constraint for Dutch IBAN format
ALTER TABLE l4l_security.supplier_profile
DROP CONSTRAINT chk_supplier_profile_iban_nl;

-- Drop the constraint for BIC format
ALTER TABLE l4l_security.supplier_profile
DROP CONSTRAINT chk_supplier_profile_bic_format;