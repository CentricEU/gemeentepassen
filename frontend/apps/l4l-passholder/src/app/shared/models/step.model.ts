import { AbstractControl } from '@angular/forms';

import { StepType } from '../enums/step-type.enum';

export class Step {
	label: string;
	control: AbstractControl;
	completed: (ctrl?: AbstractControl) => boolean;
	stepType: StepType;
	isNextEnabled: () => boolean;
}
