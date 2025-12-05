import { Component, Input, OnInit, Type } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogService } from '@windmill/ng-windmill';
@Component({
	selector: 'frontend-chip-cell',
	templateUrl: './chip-cell.component.html',
	styleUrls: ['./chip-cell.component.scss'],
})
export class ChipCellComponent<T> implements OnInit {
	@Input() public row: Record<string, any>;
	@Input() public columnWithChips: string;
	@Input() public typeOfT: Type<T>;
	@Input() public chipTitleColumn = 'title';
	@Input() shouldDisplayButton: boolean;

	public noOfDisplayedChips = 5;
	public remainingChips: number;

	private assignGrantsDialogRef: MatDialogRef<T>;

	constructor(private dialogService: DialogService) {}

	public get arrayOfChips(): [] {
		return this.row[this.columnWithChips].slice(0, this.noOfDisplayedChips);
	}

	public ngOnInit(): void {
		this.updateRemainingChips();
	}

	public openDialogWithTable(parentRecord: Record<string, any>[]): void {
		this.assignGrantsDialogRef = this.dialogService.prompt(this.typeOfT, {
			width: '600px',
			disableClose: false,
			data: {
				arrayOfChips: parentRecord[0][this.columnWithChips],
				chipTitleColumn: this.chipTitleColumn,
				parentRecord: parentRecord,
			},
		}) as MatDialogRef<T>;

		if (!this.assignGrantsDialogRef) {
			return;
		}

		this.assignGrantsDialogRef.afterClosed().subscribe(() => {
			this.updateRemainingChips();
		});
	}

	private updateRemainingChips(): void {
		this.remainingChips = this.row[this.columnWithChips].length - this.noOfDisplayedChips;
	}
}
