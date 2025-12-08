package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.enums.EmailStructureEnum;
import nl.centric.innovation.local4local.service.interfaces.MailTemplateBuilder;
import nl.centric.innovation.local4local.util.MailTemplate;
import org.springframework.stereotype.Service;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;


@Service
@RequiredArgsConstructor
public class CitizenMailTemplateBuilderImpl implements MailTemplateBuilder {

    private final ITemplateEngine templateEngine;

    public static final String TEMPLATE_NAME = "citizenSummaryEmail";

    public String buildEmailTemplate(MailTemplate mailTemplate) {
        Context context = new Context();
        context.setLocale(mailTemplate.getLocale());

        context.setVariable(EmailStructureEnum.SUBJECT.getStructure(), mailTemplate.getSubject());
        context.setVariable(EmailStructureEnum.TITLE.getStructure(), mailTemplate.getTitle());
        context.setVariable(EmailStructureEnum.CONTENT.getStructure(), mailTemplate.getContent());
        context.setVariable(EmailStructureEnum.ACTION.getStructure(), mailTemplate.getAction());
        context.setVariable(EmailStructureEnum.TENANT_NAME.getStructure(), mailTemplate.getTenantName());
        context.setVariable(EmailStructureEnum.TENANT_TELEPHONE.getStructure(), mailTemplate.getTenantTelephone());
        context.setVariable(EmailStructureEnum.TENANT_WEBSITE.getStructure(), mailTemplate.getTenantWebsite());
        context.setVariable(EmailStructureEnum.TENANT_EMAIL.getStructure(), mailTemplate.getTenantEmail());
        context.setVariable(EmailStructureEnum.END_NOTE.getStructure(), mailTemplate.getEndNote());

        return templateEngine.process(TEMPLATE_NAME, context);
    }
}

