export class RestrictionType {
	public frequencyOfUse: boolean;
	public timeSlots: boolean;
	public offerCombinations: boolean;
	public residenceRestriction: boolean;
	// public ageRestriction: boolean;
	// public priceRange: boolean;
	[key: string]: boolean;

	constructor(
		frequencyOfUse: boolean,
		timeSlots: boolean,
		offerCombinations: boolean,
		residenceRestriction: boolean,
		// ageRestriction: boolean,
		// priceRange: boolean,
	) {
		this.frequencyOfUse = frequencyOfUse;
		this.timeSlots = timeSlots;
		this.offerCombinations = offerCombinations;
		this.residenceRestriction = residenceRestriction;
		// this.ageRestriction = ageRestriction;
		// this.priceRange = priceRange;
	}
}
