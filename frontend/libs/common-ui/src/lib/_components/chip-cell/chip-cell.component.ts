import { Component, Input, OnInit, Type } from '@angular/core';

@Component({
	selector: 'frontend-chip-cell',
	templateUrl: './chip-cell.component.html',
	styleUrls: ['./chip-cell.component.scss'],
	standalone: false,
})
export class ChipCellComponent<T> implements OnInit {
	@Input() public row: Record<string, any>;
	@Input() public columnWithChips: string;
	@Input() public typeOfT: Type<T>;
	@Input() public chipTitleColumn = 'title';
	@Input() shouldDisplayButton: boolean;

	public noOfDisplayedChips = 5;
	public remainingChips: number;

	public get arrayOfChips(): any[] {
		const chips = this.row[this.columnWithChips];
		return Array.isArray(chips) ? chips.slice(0, this.noOfDisplayedChips) : [chips];
	}

	public ngOnInit(): void {
		this.updateRemainingChips();
	}

	private updateRemainingChips(): void {
		this.remainingChips = this.row[this.columnWithChips].length - this.noOfDisplayedChips;
	}
}
