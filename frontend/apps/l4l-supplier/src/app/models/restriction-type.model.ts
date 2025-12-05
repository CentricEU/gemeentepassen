export class RestrictionType {
	public frequencyOfUse: boolean;
	public timeSlots: boolean;
	public ageRestriction: boolean;
	public priceRange: boolean;
	public offerCombinations: boolean;
	public residenceRestriction: boolean;
	[key: string]: boolean;

	constructor(
		frequencyOfUse: boolean,
		timeSlots: boolean,
		ageRestriction: boolean,
		priceRange: boolean,
		offerCombinations: boolean,
		residenceRestriction: boolean,
	) {
		this.frequencyOfUse = frequencyOfUse;
		this.timeSlots = timeSlots;
		this.ageRestriction = ageRestriction;
		this.priceRange = priceRange;
		this.offerCombinations = offerCombinations;
		this.residenceRestriction = residenceRestriction;
	}
}
