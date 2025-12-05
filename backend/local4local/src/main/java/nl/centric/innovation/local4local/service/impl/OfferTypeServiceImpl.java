package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.repository.OfferTypeRepository;
import nl.centric.innovation.local4local.service.interfaces.OfferTypeService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferTypeServiceImpl implements OfferTypeService {

    private final OfferTypeRepository offerTypeRepository;

    @Override
    public List<OfferType> getAllOfferTypes() {
        return offerTypeRepository.findAll();
    }
}
